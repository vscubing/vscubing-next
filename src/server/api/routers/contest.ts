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

export const contestRouter = createTRPCRouter({
  pastContests: publicProcedure
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

  ongoing: publicProcedure.query(async ({ ctx }) => {
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
