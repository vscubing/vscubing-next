import { DISCIPLINES, resultDnfable, type RoundSession } from '@/types'
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
  getPersonalRecordSolveSubquery as getBestSolveSubquery,
  getPersonalRecordSessionSubquery,
} from '@/backend/shared/personal-record'
import { sortWithRespectToExtras } from '@/backend/shared/sort-with-respect-to-extras'
import { groupBy } from '@/lib/utils/group-by'
import { getWcaIdSubquery } from '@/backend/shared/wca-id-subquery'
import { getGlobalRecordsByUser } from '@/backend/shared/global-record'

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

      const globalRecordsByUser = await getGlobalRecordsByUser()

      return rows.map((row) => {
        return {
          user: {
            ...row.user,
            globalRecords: globalRecordsByUser.get(row.user.id) ?? null,
          },
          id: row.id,
          createdAt: row.createdAt,
          contestSlug: row.contestSlug,
          roundSessionId: row.roundSessionId,
          result: resultDnfable.parse(row.result),
          isOwn: ctx.session?.user.id === row.user.id,
        }
      })
    }),

  byAverage: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES).default(DEFAULT_DISCIPLINE),
      }),
    )
    .query(async ({ ctx, input }): Promise<RoundSession[]> => {
      const bestSessionSubquery = getPersonalRecordSessionSubquery({
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
      const globalRecordsByUser = await getGlobalRecordsByUser()

      return Array.from(solvesBySessionId.values()).map((session) => {
        return {
          session: {
            result: resultDnfable.parse(session[0]!.session),
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
                result: resultDnfable.parse({ timeMs, isDnf, plusTwoIncluded }),
                isPersonalRecord: false,
              }),
            ),
          ),
          contestSlug: session[0]!.contestSlug,
          user: {
            ...session[0]!.user,
            globalRecords: globalRecordsByUser.get(session[0]!.user.id) ?? null,
          },
        }
      })
    }),
})
