import { DISCIPLINES, resultDnfish, type RoundSession } from '@/types'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  roundTable,
  roundSessionTable,
  solveTable,
  userTable,
  scrambleTable,
} from '@/backend/db/schema'
import { eq } from 'drizzle-orm'
import { DEFAULT_DISCIPLINE } from '@/types'
import {
  getPersonalBestSolveSubquery as getBestSolveSubquery,
  getPersonalBestSessionSubquery,
} from '@/backend/shared/personal-best-subquery'
import { sortWithRespectToExtras } from '@/backend/shared/sort-with-respect-to-extras'
import { groupBy } from '@/utils/group-by'

export const leaderboardRouter = createTRPCRouter({
  bySingle: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES).default(DEFAULT_DISCIPLINE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const bestSolveSubquery = getBestSolveSubquery({
        db: ctx.db,
        discipline: input.discipline,
        includeOngoing: false,
      })

      const rows = await ctx.db
        .select({
          id: bestSolveSubquery.id,
          result: {
            timeMs: bestSolveSubquery.timeMs,
            isDnf: bestSolveSubquery.isDnf,
          },
          createdAt: bestSolveSubquery.createdAt,
          nickname: userTable.name,
          userId: userTable.id,
          contestSlug: roundTable.contestSlug,
          roundSessionId: roundSessionTable.id,
        })
        .from(bestSolveSubquery)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, bestSolveSubquery.roundSessionId),
        )
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .orderBy(bestSolveSubquery.timeMs)

      return rows.map((row) => ({
        ...row,
        result: resultDnfish.parse(row.result),
        isOwn: ctx.session?.user?.id === row.userId,
      }))
    }),

  byAverage: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES).default(DEFAULT_DISCIPLINE),
      }),
    )
    .query(async ({ ctx, input }): Promise<RoundSession[]> => {
      const bestSessionSubquery = getPersonalBestSessionSubquery({
        db: ctx.db,
        discipline: input.discipline,
        includeOngoing: false,
      })

      const rows = await ctx.db
        .select({
          session: {
            id: bestSessionSubquery.id,
            timeMs: bestSessionSubquery.avgMs,
            isDnf: bestSessionSubquery.isDnf,
          },
          solve: {
            timeMs: solveTable.timeMs,
            isDnf: solveTable.isDnf,
            id: solveTable.id,
            position: scrambleTable.position,
          },
          user: {
            name: userTable.name,
            id: userTable.id,
          },
          contestSlug: roundTable.contestSlug,
        })
        .from(bestSessionSubquery)
        .innerJoin(
          solveTable,
          eq(solveTable.roundSessionId, bestSessionSubquery.id),
        )
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(roundTable, eq(roundTable.id, bestSessionSubquery.roundId))
        .innerJoin(
          userTable,
          eq(userTable.id, bestSessionSubquery.contestantId),
        )
        .where(eq(solveTable.status, 'submitted'))
        .orderBy(bestSessionSubquery.avgMs)

      const solvesBySessionId = groupBy(rows, ({ session }) => session.id)

      return Array.from(solvesBySessionId.values()).map((session) => {
        return {
          session: {
            result: resultDnfish.parse(session[0]!.session),
            id: session[0]!.session.id,
            isOwn: session[0]!.user.id === ctx.session?.user.id,
          },
          solves: sortWithRespectToExtras(
            session.map(({ solve: { id, position, isDnf, timeMs } }) => ({
              id,
              position,
              result: resultDnfish.parse({ timeMs, isDnf }),
              isPersonalBest: false,
            })),
          ),
          contestSlug: session[0]!.contestSlug,
          nickname: session[0]!.user.name,
        }
      })
    }),
})
