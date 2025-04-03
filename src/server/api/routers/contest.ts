import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import {
  contestTable,
  contestDisciplineTable,
  disciplineTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
  userTable,
} from '@/server/db/schema'
import { DISCIPLINES, CONTEST_UNAUTHORIZED_MESSAGE } from '@/shared'
import { eq, desc, and, lt } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  resultDnfish,
  type Discipline,
  type ContestResultRoundSession,
} from '@/app/_types'
import { groupBy } from '@/app/_utils/groupBy'
import { db } from '@/server/db'
import { auth } from '@/server/auth'
import { sortWithRespectToExtras } from './sort-with-respect-to-extras'

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
        .from(contestTable)
        .leftJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.contestSlug, contestTable.slug),
        )
        .leftJoin(
          disciplineTable,
          eq(contestDisciplineTable.disciplineSlug, disciplineTable.slug),
        )
        .where(
          and(
            eq(contestTable.isOngoing, false),
            eq(disciplineTable.slug, input.discipline),
            input.cursor ? lt(contestTable.startDate, input.cursor) : undefined,
          ),
        )
        .orderBy(desc(contestTable.startDate))
        .limit(input.limit + 1)

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        nextCursor = items.pop()?.contest.startDate
      }

      return { items, nextCursor }
    }),

  getOngoing: publicProcedure.query(async ({ ctx }) => {
    const [ongoing] = await ctx.db
      .select()
      .from(contestTable)
      .where(eq(contestTable.isOngoing, true))

    if (!ongoing)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No ongoing contest!',
      })

    return ongoing
  }),

  getContestMetaData: publicProcedure
    .input(z.object({ contestSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          slug: contestTable.slug,
          startDate: contestTable.startDate,
          expectedEndDate: contestTable.expectedEndDate,
          endDate: contestTable.endDate,
          isOngoing: contestTable.isOngoing,
          disciplineSlug: contestDisciplineTable.disciplineSlug,
        })
        .from(contestTable)
        .innerJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.contestSlug, input.contestSlug),
        )
        .innerJoin(
          disciplineTable,
          eq(disciplineTable.slug, contestDisciplineTable.disciplineSlug),
        )
        .where(eq(contestTable.slug, input.contestSlug))
        .orderBy(disciplineTable.createdAt)

      const firstRow = rows[0]
      if (!firstRow)
        throw new TRPCError({
          code: 'NOT_FOUND',
        })

      const { slug, startDate, expectedEndDate, endDate, isOngoing } = firstRow
      return {
        slug,
        startDate,
        expectedEndDate,
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
      })
      if (userCapabilities === 'CONTEST_NOT_FOUND')
        throw new TRPCError({ code: 'NOT_FOUND' })

      if (userCapabilities === 'UNAUTHORIZED')
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: CONTEST_UNAUTHORIZED_MESSAGE,
        })

      if (userCapabilities === 'SOLVE')
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You can't see the results of an ongoing contest round before finishing it",
        })

      // `input.limit` and `input.offset` correspond to the amount of sessions, and we query for solve rows, which map 5 to 1 to sessions
      const rowLimit = input.limit * 5
      const rowOffset = input.offset * 5

      const queryRes = await ctx.db
        .select({
          roundSessionId: roundSessionTable.id,
          nickname: userTable.name,
          contestantId: roundSessionTable.contestantId,
          avgMs: roundSessionTable.avgMs,
          solveId: solveTable.id,
          timeMs: solveTable.timeMs,
          isDnf: solveTable.isDnf,
          position: scrambleTable.position,
        })
        .from(contestDisciplineTable)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.contestDisciplineId, contestDisciplineTable.id),
        )
        .innerJoin(
          solveTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .where(
          and(
            eq(contestDisciplineTable.contestSlug, input.contestSlug),
            eq(contestDisciplineTable.disciplineSlug, input.discipline),
            eq(roundSessionTable.isFinished, true),
            eq(solveTable.state, 'submitted'),
          ),
        )
        .orderBy(roundSessionTable.avgMs)
        .limit(rowLimit + 5)
        .offset(rowOffset)

      const solvesBySessionId = groupBy(
        queryRes,
        ({ roundSessionId }) => roundSessionId,
      )

      const items: ContestResultRoundSession[] = Array.from(
        solvesBySessionId.values(),
      )
        .sort((a, b) => (a[0]!.avgMs ?? -Infinity) - (b[0]!.avgMs ?? -Infinity))
        .map((session) => ({
          avgMs: session[0]!.avgMs,
          id: session[0]!.roundSessionId,
          isOwn: session[0]!.contestantId === ctx.session?.user.id,
          solves: sortWithRespectToExtras(
            session.map(({ solveId, timeMs, isDnf, position }) => ({
              id: solveId,
              position,
              result: resultDnfish.parse({ timeMs, isDnf }),
            })),
          ),
          nickname: session[0]!.nickname,
        }))

      let nextOffset: number | undefined = undefined
      if (items.length > input.limit) {
        items.pop()
        nextOffset = input.offset + input.limit
      }

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
          solution: solveTable.solution,
          username: userTable.name,
          timeMs: solveTable.timeMs,
          discipline: contestDisciplineTable.disciplineSlug,
        })
        .from(solveTable)
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .innerJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.id, roundSessionTable.contestDisciplineId),
        )
        .where(eq(solveTable.id, input.solveId))

      if (!solve) throw new TRPCError({ code: 'NOT_FOUND' })

      if (!solve.solution || !solve.timeMs || !solve.scramble)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The solve exists, but it is incomplete. \nSolution: ${solve.solution} \ntimeMs: ${solve.timeMs} \nscramble: ${solve.scramble}`,
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
}: {
  contestSlug: string
  discipline: Discipline
}): Promise<'CONTEST_NOT_FOUND' | 'SOLVE' | 'VIEW_RESULTS' | 'UNAUTHORIZED'> {
  const [contest] = await db
    .select({ isOngoing: contestTable.isOngoing })
    .from(contestTable)
    .fullJoin(
      contestDisciplineTable,
      eq(contestDisciplineTable.contestSlug, contestTable.slug),
    )
    .where(
      and(
        eq(contestTable.slug, contestSlug),
        eq(contestDisciplineTable.disciplineSlug, discipline),
      ),
    )

  if (!contest) return 'CONTEST_NOT_FOUND'
  if (!contest.isOngoing) return 'VIEW_RESULTS'

  const session = await auth()
  if (!session) return 'UNAUTHORIZED'

  const [ownSession] = await db
    .select({ isFinished: roundSessionTable.isFinished })
    .from(contestDisciplineTable)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.contestDisciplineId, contestDisciplineTable.id),
    )
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(contestDisciplineTable.contestSlug, contestSlug),
        eq(contestDisciplineTable.disciplineSlug, discipline),
        eq(userTable.id, session.user.id),
      ),
    )

  return ownSession?.isFinished ? 'VIEW_RESULTS' : 'SOLVE'
}
