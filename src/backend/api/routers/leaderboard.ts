import { DISCIPLINES } from '@/types'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  roundTable,
  roundSessionTable,
  solveTable,
  userTable,
} from '@/backend/db/schema'
import { eq } from 'drizzle-orm'
import { DEFAULT_DISCIPLINE } from '@/types'
import { getPersonalBestSubquery } from '@/backend/shared/personal-best-subquery'

export const leaderboardRouter = createTRPCRouter({
  bySingle: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES).default(DEFAULT_DISCIPLINE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const personalBestSubquery = getPersonalBestSubquery({
        db: ctx.db,
        discipline: input.discipline,
        includeOngoing: false,
      })

      const rows = await ctx.db
        .select({
          id: personalBestSubquery.id,
          timeMs: solveTable.timeMs,
          createdAt: solveTable.createdAt,
          nickname: userTable.name,
          userId: userTable.id,
          contestSlug: roundTable.contestSlug,
        })
        .from(personalBestSubquery)
        .innerJoin(solveTable, eq(solveTable.id, personalBestSubquery.id))
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
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
