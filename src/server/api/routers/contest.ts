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
import { eq, desc, and, lt, count } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { api } from '@/trpc/server'

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
        .select()
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
      const res = await ctx.db
        .select()
        .from(contestsTable)
        .where(eq(contestsTable.slug, input.contestSlug))

      if (!res || res.length === 0)
        throw new TRPCError({
          code: 'NOT_FOUND',
        })

      return res[0]!
    }),

  getContestResults: publicProcedure
    .input(
      z.object({ contestSlug: z.string(), discipline: z.enum(DISCIPLINES) }),
    )
    .query(async ({ ctx, input }) => {
      const isOngoing = await ctx.db
        .select({ isOngoing: contestsTable.isOngoing })
        .from(contestsTable)
        .where(eq(contestsTable.slug, input.contestSlug))

      if (isOngoing) {
        if (!ctx.session)
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message:
              'You must be authorized to participate in an ongoing contest or view its results',
          })

        const [ownSession] = await ctx.db
          .select({ isFinished: roundSessionTable.isFinished })
          .from(contestsToDisciplinesTable)
          .innerJoin(
            roundSessionTable,
            eq(
              roundSessionTable.contestDisciplineId,
              contestsToDisciplinesTable.id,
            ),
          )
          .innerJoin(
            usersTable,
            eq(usersTable.id, roundSessionTable.contestantId),
          )
          .where(
            and(
              eq(contestsToDisciplinesTable.contestSlug, input.contestSlug),
              eq(contestsToDisciplinesTable.disciplineSlug, input.discipline),
              eq(usersTable.id, ctx.session.user.id),
            ),
          )
        if (!ownSession || !ownSession.isFinished)
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              "You can't see the results of an ongoing contest round before finishing it",
          })
      }

      return ctx.db
        .select({
          solveId: solveTable.id,
          timeMs: solveTable.timeMs,
          avgMs: roundSessionTable.avgMs,
          nickname: usersTable.name,
          position: scrambleTable.position,
          state: solveTable.state,
        })
        .from(contestsToDisciplinesTable)
        .where(
          and(
            eq(contestsToDisciplinesTable.contestSlug, input.contestSlug),
            eq(contestsToDisciplinesTable.disciplineSlug, input.discipline),
          ),
        )
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
        .orderBy(roundSessionTable.avgMs)
    }),

  getSolve: publicProcedure
    .input(
      z.object({
        solveId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
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
      const solve = res[0]

      if (!solve) throw new TRPCError({ code: 'NOT_FOUND' })

      // const { scramble, solution, timeMs, ...rest } = solve
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
