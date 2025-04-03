import { DISCIPLINES } from '@/shared'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  contestDisciplineTable,
  contestTable,
  roundSessionTable,
  solveTable,
  userTable,
} from '@/server/db/schema'
import { and, eq, isNotNull } from 'drizzle-orm'

export const leaderboardRouter = createTRPCRouter({
  bySingle: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        cursor: z.string().optional(),
        limit: z.number().min(1).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const bestSolveByUserUnsorted = ctx.db
        .selectDistinctOn([userTable.id], {
          id: solveTable.id,
        })
        .from(solveTable)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.id, roundSessionTable.contestDisciplineId),
        )
        .innerJoin(
          contestTable,
          eq(contestTable.slug, contestDisciplineTable.contestSlug),
        )
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .where(
          and(
            eq(solveTable.isDnf, false),
            isNotNull(solveTable.timeMs),
            eq(contestDisciplineTable.disciplineSlug, input.discipline),
            eq(contestTable.isOngoing, false),
          ),
        )
        .orderBy(userTable.id, solveTable.timeMs)
        .as('sq')

      const rows = await ctx.db
        .select({
          id: bestSolveByUserUnsorted.id,
          timeMs: solveTable.timeMs,
          createdAt: solveTable.createdAt,
          nickname: userTable.name,
          userId: userTable.id,
          contestSlug: contestDisciplineTable.contestSlug,
        })
        .from(bestSolveByUserUnsorted)
        .innerJoin(solveTable, eq(solveTable.id, bestSolveByUserUnsorted.id))
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.id, roundSessionTable.contestDisciplineId),
        )
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .orderBy(solveTable.timeMs)

      return rows.map((row) => ({
        ...row,
        timeMs: row.timeMs!, // manually cast timeMs as non nullable because drizzle doesn't pick up on `isNotNull` in the query
        isOwn: ctx.session?.user?.id === row.userId,
      }))
    }),
})
