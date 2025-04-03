import { DISCIPLINES } from '@/shared'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  contestDisciplineTable,
  roundSessionTable,
  solveTable,
  userTable,
} from '@/server/db/schema'
import { and, eq, isNotNull } from 'drizzle-orm'

export const contestRouter = createTRPCRouter({
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
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .where(
          and(
            eq(solveTable.isDnf, false),
            isNotNull(solveTable.timeMs),
            eq(contestDisciplineTable.disciplineSlug, input.discipline),
          ),
        )
        .orderBy(userTable.id, solveTable.timeMs)
        .as('sq')

      return ctx.db
        .select({
          id: bestSolveByUserUnsorted.id,
          timeMs: solveTable.timeMs,
          createdAt: solveTable.createdAt,
          contestantId: userTable.id,
          contestSlug: contestDisciplineTable.contestSlug,
        })
        .from(bestSolveByUserUnsorted)
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
    }),
})
