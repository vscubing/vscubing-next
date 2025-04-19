import { DISCIPLINES, resultDnfish, type RoundSession } from '@/types'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import {
  roundTable,
  roundSessionTable,
  solveTable,
  userTable,
  scrambleTable,
  contestTable,
} from '@/backend/db/schema'
import { and, eq, getTableColumns, sql } from 'drizzle-orm'
import { DEFAULT_DISCIPLINE } from '@/types'
import {
  getPersonalBestSolveSubquery as getBestSolveSubquery,
  getPersonalBestSessionSubquery,
} from '@/backend/shared/personal-best-subquery'
import { sortWithRespectToExtras } from '@/backend/shared/sort-with-respect-to-extras'
import { groupBy } from '@/utils/group-by'
import { getWcaIdSubquery } from '@/backend/shared/wca-id-subquery'

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

  recordHolders: publicProcedure.query(async ({ ctx }) => {
    const averageSubquery = ctx.db
      .selectDistinctOn([roundTable.disciplineSlug])
      .from(roundSessionTable)
      .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
      .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
      .where(
        and(
          eq(roundSessionTable.isFinished, true),
          eq(contestTable.isOngoing, false), // TODO: remove this when we make leaderboards to update immediately and not after a contest ends
        ),
      )
      .orderBy(
        roundTable.disciplineSlug,
        roundSessionTable.isDnf,
        roundSessionTable.avgMs,
      )
      .as('average_subquery')

    const singleSubquery = ctx.db
      .selectDistinctOn([roundTable.disciplineSlug])
      .from(solveTable)
      .innerJoin(
        roundSessionTable,
        eq(roundSessionTable.id, solveTable.roundSessionId),
      )
      .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
      .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
      .where(
        and(
          eq(solveTable.status, 'submitted'),
          eq(contestTable.isOngoing, false), // TODO: remove this when we make leaderboards to update immediately and not after a contest ends
        ),
      )
      .orderBy(roundTable.disciplineSlug, solveTable.isDnf, solveTable.timeMs)
      .as('single_subquery')

    const [average, single] = await Promise.all([
      ctx.db
        .select({
          userId: userTable.id,
          discipline: averageSubquery.round.disciplineSlug,
        })
        .from(averageSubquery)
        .innerJoin(
          userTable,
          eq(userTable.id, averageSubquery.round_session.contestantId),
        ),
      ctx.db
        .select({
          userId: userTable.id,
          discipline: singleSubquery.round.disciplineSlug,
        })
        .from(singleSubquery)
        .innerJoin(
          userTable,
          eq(userTable.id, singleSubquery.round_session.contestantId),
        ),
    ])
    return { average, single }
  }),
})
