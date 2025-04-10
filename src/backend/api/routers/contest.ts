import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/backend/api/trpc'
import {
  contestTable,
  roundTable,
  disciplineTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
  userTable,
} from '@/backend/db/schema'
import { DISCIPLINES, CONTEST_UNAUTHORIZED_MESSAGE } from '@/types'
import { eq, desc, and, lte } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { resultDnfish, type ContestResultRoundSession } from '@/types'
import { groupBy } from '@/utils/group-by'
import { sortWithRespectToExtras } from '../../shared/sort-with-respect-to-extras'
import { getContestUserCapabilities } from '../../shared/get-contest-user-capabilities'

export const contestRouter = createTRPCRouter({
  getPastContests: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        cursor: z.string().optional(),
        limit: z.number().min(1).default(15),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .selectDistinctOn([contestTable.startDate, roundTable.id], {
          slug: contestTable.slug,
          startDate: contestTable.startDate,
          expectedEndDate: contestTable.expectedEndDate,
          endDate: contestTable.endDate,
          isOngoing: contestTable.isOngoing,
        })
        .from(contestTable)
        .innerJoin(roundTable, eq(roundTable.contestSlug, contestTable.slug))
        .innerJoin(
          disciplineTable,
          eq(roundTable.disciplineSlug, disciplineTable.slug),
        )
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.roundId, roundTable.id),
        )
        .where(
          and(
            eq(contestTable.isOngoing, false),
            eq(disciplineTable.slug, input.discipline),
            input.cursor
              ? lte(contestTable.startDate, input.cursor)
              : undefined,
          ),
        )
        .orderBy(desc(contestTable.startDate), roundTable.id)
        .limit(input.limit + 1)

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        nextCursor = items.pop()?.startDate
      }

      return { items, nextCursor }
    }),

  getOngoing: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        slug: contestTable.slug,
        startDate: contestTable.startDate,
        expectedEndDate: contestTable.expectedEndDate,
        endDate: contestTable.endDate,
        isOngoing: contestTable.isOngoing,
        discipline: roundTable.disciplineSlug,
      })
      .from(contestTable)
      .innerJoin(roundTable, eq(roundTable.contestSlug, contestTable.slug))
      .where(eq(contestTable.isOngoing, true))

    const ongoing = rows[0]
    if (!ongoing) return null

    return {
      ...ongoing,
      disciplines: rows.map(({ discipline }) => discipline),
    }
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
          disciplineSlug: roundTable.disciplineSlug,
        })
        .from(contestTable)
        .innerJoin(roundTable, eq(roundTable.contestSlug, input.contestSlug))
        .innerJoin(
          disciplineTable,
          eq(disciplineTable.slug, roundTable.disciplineSlug),
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
        .from(roundTable)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.roundId, roundTable.id),
        )
        .innerJoin(
          solveTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .where(
          and(
            eq(roundTable.contestSlug, input.contestSlug),
            eq(roundTable.disciplineSlug, input.discipline),
            eq(roundSessionTable.isFinished, true),
            eq(solveTable.status, 'submitted'),
          ),
        )
        .orderBy(roundSessionTable.avgMs)

      const solvesBySessionId = groupBy(
        queryRes,
        ({ roundSessionId }) => roundSessionId,
      )

      return Array.from(solvesBySessionId.values())
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
        })) satisfies ContestResultRoundSession[]
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
          discipline: roundTable.disciplineSlug,
        })
        .from(solveTable)
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
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
