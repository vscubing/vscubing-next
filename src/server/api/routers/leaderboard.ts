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
import { db } from '@/server/db'
import { DEFAULT_DISCIPLINE } from '@/app/_types'

export const leaderboardRouter = createTRPCRouter({
  bySingle: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES).default(DEFAULT_DISCIPLINE),
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

      return rows.map((row) => {
        if (!row.timeMs)
          throw new Error(`[leaderboard] no time_ms for solveId ${row.id}`)
        return {
          ...row,
          timeMs: row.timeMs, // infers timeMs as non-nullable
          isOwn: ctx.session?.user?.id === row.userId,
        }
      })
    }),
})
