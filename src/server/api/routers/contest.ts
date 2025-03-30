import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import {
  contestsTable,
  contestsToDisciplinesTable,
  disciplinesTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
  usersTable,
} from '@/server/db/schema'
import { DISCIPLINES } from '@/shared'
import { eq, desc, and, lt } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import type { Discipline, RoundSession } from '@/app/_types'
import { groupBy } from '@/app/_utils/groupBy'
import type { db as dbType } from '@/server/db'

export const contestRouter = createTRPCRouter({
  getPastContests: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        cursor: z.string().optional(),
        limit: z.number().min(1).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select() // TODO: don't select *
        .from(contestsTable)
        .leftJoin(
          contestsToDisciplinesTable,
          eq(contestsToDisciplinesTable.contestSlug, contestsTable.slug),
        )
        .leftJoin(
          disciplinesTable,
          eq(contestsToDisciplinesTable.disciplineSlug, disciplinesTable.slug),
        )
        .where(
          and(
            eq(contestsTable.isOngoing, false),
            eq(disciplinesTable.slug, input.discipline),
            input.cursor
              ? lt(contestsTable.startDate, input.cursor)
              : undefined,
          ),
        )
        .orderBy(desc(contestsTable.startDate))
        .limit(input.limit + 1)

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        nextCursor = items.pop()?.contest.startDate
      }

      return { items, nextCursor }
    }),

  getOngoing: publicProcedure.query(async ({ ctx }) => {
    const ongoingList = await ctx.db
      .select()
      .from(contestsTable)
      .where(eq(contestsTable.isOngoing, true))

    if (!ongoingList || ongoingList.length === 0)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No ongoing contest!',
      })
    if (ongoingList.length > 1)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'More then one ongoing contest!',
      })

    return ongoingList[0]!
  }),

  getContestMetaData: publicProcedure
    .input(z.object({ contestSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          slug: contestsTable.slug,
          startDate: contestsTable.startDate,
          endDate: contestsTable.endDate,
          isOngoing: contestsTable.isOngoing,
          disciplineSlug: contestsToDisciplinesTable.disciplineSlug,
        })
        .from(contestsTable)
        .innerJoin(
          contestsToDisciplinesTable,
          eq(contestsToDisciplinesTable.contestSlug, input.contestSlug),
        )
        .where(eq(contestsTable.slug, input.contestSlug))

      const firstRow = rows[0]
      if (!firstRow)
        throw new TRPCError({
          code: 'NOT_FOUND',
        })

      const { slug, startDate, endDate, isOngoing } = firstRow
      return {
        slug,
        startDate,
        endDate,
        isOngoing,
        disciplines: rows.map(({ disciplineSlug }) => disciplineSlug),
      }
    }),

  getContestResults: publicProcedure
    .input(
      z.object({
        contestSlug: z.string(),
        discipline: z.enum(DISCIPLINES),
        offset: z.number().optional().default(0),
        limit: z.number().min(1).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userCapabilities = await getContestUserCapabilities({
        contestSlug: input.contestSlug,
        discipline: input.discipline,
        userId: ctx.session?.user.id,
        db: ctx.db,
      })
      if (userCapabilities === 'CONTEST_NOT_FOUND')
        throw new TRPCError({ code: 'NOT_FOUND' })

      if (userCapabilities === 'UNAUTHORIZED')
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'You need to be signed in to participate in an ongoing contest or view its results',
        })

      if (userCapabilities === 'SOLVE')
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You can't see the results of an ongoing contest round before finishing it",
        })

      const queryRes = await ctx.db
        .select({
          roundSessionId: roundSessionTable.id,
          nickname: usersTable.name,
          contestantId: roundSessionTable.contestantId,
          avgMs: roundSessionTable.avgMs,
          solveId: solveTable.id,
          timeMs: solveTable.timeMs,
          isDnf: solveTable.isDnf,
          scramblePosition: scrambleTable.position,
        })
        .from(contestsToDisciplinesTable)
        .innerJoin(
          roundSessionTable,
          eq(
            roundSessionTable.contestDisciplineId,
            contestsToDisciplinesTable.id,
          ),
        )
        .innerJoin(
          solveTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(
          usersTable,
          eq(usersTable.id, roundSessionTable.contestantId),
        )
        .where(
          and(
            eq(contestsToDisciplinesTable.contestSlug, input.contestSlug),
            eq(contestsToDisciplinesTable.disciplineSlug, input.discipline),
            eq(solveTable.state, 'submitted'),
          ),
        )
        .orderBy(roundSessionTable.avgMs)
        .limit(input.limit + 1)
        .offset(input.offset)

      const solvesBySessionId = groupBy(
        queryRes,
        ({ roundSessionId }) => roundSessionId,
      )

      const items: RoundSession[] = Array.from(solvesBySessionId.values())
        .sort((a, b) => (a[0]!.avgMs ?? -Infinity) - (b[0]!.avgMs ?? -Infinity))
        .map((session) => ({
          avgMs: session[0]!.avgMs,
          id: session[0]!.roundSessionId,
          isOwn: session[0]!.contestantId === ctx.session?.user.id,
          solves: session.map(
            ({ solveId, timeMs, isDnf, scramblePosition }) => ({
              id: solveId,
              timeMs,
              isDnf,
              scramblePosition,
            }),
          ),
          nickname: session[0]!.nickname,
        }))

      const nextOffset = items.pop() ? input.offset + 1 : undefined

      return { items, nextOffset }
    }),

  getSolve: publicProcedure
    .input(
      z.object({
        solveId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [solve] = await ctx.db
        .select({
          scramble: scrambleTable.moves,
          position: scrambleTable.position,
          solution: solveTable.reconstruction,
          username: usersTable.name,
          timeMs: solveTable.timeMs,
          discipline: contestsToDisciplinesTable.disciplineSlug,
        })
        .from(solveTable)
        .where(eq(solveTable.id, input.solveId))
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(
          usersTable,
          eq(usersTable.id, roundSessionTable.contestantId),
        )
        .innerJoin(
          contestsToDisciplinesTable,
          eq(
            contestsToDisciplinesTable.id,
            roundSessionTable.contestDisciplineId,
          ),
        )

      if (!solve) throw new TRPCError({ code: 'NOT_FOUND' })

      if (!solve.solution || !solve.timeMs || !solve.scramble)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The solve exists, but is incomplete. \nSolution: ${solve.solution} \ntimeMs: ${solve.timeMs} \nscramble: ${solve.scramble}`,
        })

      return {
        ...solve,
        solution: solve.solution, // reassign to make typescript infer non-nullability
        timeMs: solve.timeMs,
        scramble: solve.scramble,
      }
    }),
})

export async function getContestUserCapabilities({
  contestSlug,
  discipline,
  userId,
  db,
}: {
  contestSlug: string
  discipline: Discipline
  userId?: string
  db: typeof dbType
}): Promise<'CONTEST_NOT_FOUND' | 'SOLVE' | 'VIEW_RESULTS' | 'UNAUTHORIZED'> {
  const [contest] = await db
    .select({ isOngoing: contestsTable.isOngoing })
    .from(contestsTable)
    .fullJoin(
      contestsToDisciplinesTable,
      eq(contestsToDisciplinesTable.contestSlug, contestsTable.slug),
    )
    .where(
      and(
        eq(contestsTable.slug, contestSlug),
        eq(contestsToDisciplinesTable.disciplineSlug, discipline),
      ),
    )

  if (!contest) return 'CONTEST_NOT_FOUND'
  if (!contest.isOngoing) return 'VIEW_RESULTS'

  if (!userId) return 'UNAUTHORIZED'

  const [ownSession] = await db
    .select({ isFinished: roundSessionTable.isFinished })
    .from(contestsToDisciplinesTable)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.contestDisciplineId, contestsToDisciplinesTable.id),
    )
    .innerJoin(usersTable, eq(usersTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(contestsToDisciplinesTable.contestSlug, contestSlug),
        eq(contestsToDisciplinesTable.disciplineSlug, discipline),
        eq(usersTable.id, userId),
      ),
    )

  return ownSession?.isFinished ? 'VIEW_RESULTS' : 'SOLVE'
}
