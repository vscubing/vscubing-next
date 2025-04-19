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
import { getWcaIdSubquery } from '@/backend/shared/wca-id-subquery'
import {
  averageRecordSubquery,
  singleRecordSubquery,
} from '@/backend/shared/record-subquery'

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
      const wcaIdSubquery = getWcaIdSubquery({ db: ctx.db })

      const rows = await ctx.db
        .select({
          id: bestSolveSubquery.id,
          result: {
            timeMs: bestSolveSubquery.timeMs,
            isDnf: bestSolveSubquery.isDnf,
          },
          createdAt: bestSolveSubquery.createdAt,
          user: {
            name: userTable.name,
            id: userTable.id,
            wcaId: wcaIdSubquery.wcaId,
            role: userTable.role,
            singleRecords: ctx.db.$count(
              singleRecordSubquery,
              eq(singleRecordSubquery.round_session.contestantId, userTable.id),
            ),
            averageRecords: ctx.db.$count(
              averageRecordSubquery,
              eq(
                averageRecordSubquery.round_session.contestantId,
                userTable.id,
              ),
            ),
          },
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
        .leftJoin(wcaIdSubquery, eq(wcaIdSubquery.userId, userTable.id))
        .orderBy(bestSolveSubquery.timeMs)

      return rows.map((row) => ({
        user: row.user,
        id: row.id,
        createdAt: row.createdAt,
        contestSlug: row.contestSlug,
        roundSessionId: row.roundSessionId,
        result: resultDnfish.parse(row.result),
        isOwn: ctx.session?.user.id === row.user.id,
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
      const wcaIdSubquery = getWcaIdSubquery({ db: ctx.db })

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
            plusTwoIncluded: solveTable.plusTwoIncluded,
            id: solveTable.id,
            position: scrambleTable.position,
          },
          user: {
            name: userTable.name,
            id: userTable.id,
            wcaId: wcaIdSubquery.wcaId,
            role: userTable.role,
            singleRecords: ctx.db.$count(
              singleRecordSubquery,
              eq(singleRecordSubquery.round_session.contestantId, userTable.id),
            ),
            averageRecords: ctx.db.$count(
              averageRecordSubquery,
              eq(
                averageRecordSubquery.round_session.contestantId,
                userTable.id,
              ),
            ),
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
        .leftJoin(wcaIdSubquery, eq(wcaIdSubquery.userId, userTable.id))
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
            session.map(
              ({
                solve: { id, position, isDnf, timeMs, plusTwoIncluded },
              }) => ({
                id,
                position,
                result: resultDnfish.parse({ timeMs, isDnf, plusTwoIncluded }),
                isPersonalBest: false,
              }),
            ),
          ),
          contestSlug: session[0]!.contestSlug,
          user: session[0]!.user,
        }
      })
    }),
})
