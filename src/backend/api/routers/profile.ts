import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import {
  userTable,
  roundSessionTable,
  roundTable,
  contestTable,
  solveTable,
  userMetadataTable,
} from '@/backend/db/schema'
import { and, eq, sql, lt, gte, count, countDistinct, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { getWcaIdSubquery } from '@/backend/shared/wca-id-subquery'
import { getGlobalRecordsByUser } from '@/backend/shared/global-record'
import {
  getPersonalRecordSolveSubquery,
  getPersonalRecordSessionSubquery,
} from '@/backend/shared/personal-record'
import { DISCIPLINES, type Discipline } from '@/types'

export const profileRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const wcaIdSubquery = getWcaIdSubquery({ db: ctx.db })

      const [row] = await ctx.db
        .select({
          id: userTable.id,
          name: userTable.name,
          role: userTable.role,
          createdAt: userTable.createdAt,
          wcaId: wcaIdSubquery.wcaId,
          bio: userMetadataTable.bio,
        })
        .from(userTable)
        .leftJoin(wcaIdSubquery, eq(wcaIdSubquery.userId, userTable.id))
        .leftJoin(userMetadataTable, eq(userMetadataTable.userId, userTable.id))
        .where(eq(userTable.name, input.username))

      if (!row) throw new TRPCError({ code: 'NOT_FOUND' })

      const globalRecordsByUser = await getGlobalRecordsByUser()

      return {
        id: row.id,
        name: row.name,
        role: row.role,
        createdAt: row.createdAt,
        wcaId: row.wcaId ?? null,
        bio: row.bio ?? '',
        globalRecords: globalRecordsByUser.get(row.id) ?? null,
        isOwnProfile: ctx.session?.user.id === row.id,
      }
    }),

  getCompletedSolves: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          discipline: roundTable.disciplineSlug,
          solveCount: count(solveTable.id),
          contestCount: countDistinct(roundTable.contestSlug),
        })
        .from(solveTable)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .where(
          and(
            eq(roundSessionTable.contestantId, input.userId),
            eq(solveTable.status, 'submitted'),
          ),
        )
        .groupBy(roundTable.disciplineSlug)

      return rows.map((row) => ({
        discipline: row.discipline as Discipline,
        solveCount: Number(row.solveCount),
        contestCount: Number(row.contestCount),
      }))
    }),

  getPersonalRecords: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results: {
        discipline: Discipline
        single: {
          timeMs: number
          solveId: number
          contestSlug: string
          rank: number
        } | null
        average: {
          timeMs: number
          sessionId: number
          contestSlug: string
          rank: number
        } | null
      }[] = []

      for (const discipline of DISCIPLINES) {
        const bestSolveSubquery = getPersonalRecordSolveSubquery({
          db: ctx.db,
          discipline,
          includeOngoing: false,
        })

        const [userBestSolve] = await ctx.db
          .select({
            id: bestSolveSubquery.id,
            timeMs: bestSolveSubquery.timeMs,
            isDnf: bestSolveSubquery.isDnf,
            contestantId: bestSolveSubquery.roundSessionId,
          })
          .from(bestSolveSubquery)
          .innerJoin(
            roundSessionTable,
            eq(roundSessionTable.id, bestSolveSubquery.roundSessionId),
          )
          .where(eq(roundSessionTable.contestantId, input.userId))

        let single: (typeof results)[number]['single'] = null
        if (userBestSolve && !userBestSolve.isDnf && userBestSolve.timeMs) {
          const [rankResult] = await ctx.db
            .select({ count: count() })
            .from(bestSolveSubquery)
            .where(
              and(
                eq(bestSolveSubquery.isDnf, false),
                lt(bestSolveSubquery.timeMs, userBestSolve.timeMs),
              ),
            )

          const [sessionForSolve] = await ctx.db
            .select({
              contestSlug: roundTable.contestSlug,
            })
            .from(solveTable)
            .innerJoin(
              roundSessionTable,
              eq(roundSessionTable.id, solveTable.roundSessionId),
            )
            .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
            .where(eq(solveTable.id, userBestSolve.id))

          single = {
            timeMs: userBestSolve.timeMs,
            solveId: userBestSolve.id,
            contestSlug: sessionForSolve?.contestSlug ?? '',
            rank: (rankResult?.count ?? 0) + 1,
          }
        }

        const bestSessionSubquery = getPersonalRecordSessionSubquery({
          db: ctx.db,
          discipline,
          includeOngoing: false,
        })

        const [userBestSession] = await ctx.db
          .select({
            id: bestSessionSubquery.id,
            avgMs: bestSessionSubquery.avgMs,
            isDnf: bestSessionSubquery.isDnf,
            contestantId: bestSessionSubquery.contestantId,
          })
          .from(bestSessionSubquery)
          .where(eq(bestSessionSubquery.contestantId, input.userId))

        let average: (typeof results)[number]['average'] = null
        if (
          userBestSession &&
          !userBestSession.isDnf &&
          userBestSession.avgMs
        ) {
          const [rankResult] = await ctx.db
            .select({ count: count() })
            .from(bestSessionSubquery)
            .where(
              and(
                eq(bestSessionSubquery.isDnf, false),
                lt(bestSessionSubquery.avgMs, userBestSession.avgMs),
              ),
            )

          const [sessionContest] = await ctx.db
            .select({
              contestSlug: roundTable.contestSlug,
            })
            .from(roundSessionTable)
            .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
            .where(eq(roundSessionTable.id, userBestSession.id))

          average = {
            timeMs: userBestSession.avgMs,
            sessionId: userBestSession.id,
            contestSlug: sessionContest?.contestSlug ?? '',
            rank: (rankResult?.count ?? 0) + 1,
          }
        }

        results.push({ discipline, single, average })
      }

      return results
    }),

  getProgress: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        discipline: z.enum(DISCIPLINES),
        timeFrame: z.enum(['3months', '6months', '1year', 'all']),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date()
      let dateFilter: Date | null = null
      if (input.timeFrame === '3months') {
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        )
      } else if (input.timeFrame === '6months') {
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate(),
        )
      } else if (input.timeFrame === '1year') {
        dateFilter = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        )
      }

      const rows = await ctx.db
        .select({
          sessionId: roundSessionTable.id,
          avgMs: roundSessionTable.avgMs,
          isDnf: roundSessionTable.isDnf,
          contestSlug: contestTable.slug,
          contestStartDate: contestTable.startDate,
          contestType: contestTable.type,
          bestSingleMs: sql<
            number | null
          >`min(case when ${solveTable.status} = 'submitted' and ${solveTable.isDnf} = false then ${solveTable.timeMs} end)`,
        })
        .from(roundSessionTable)
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
        .leftJoin(
          solveTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .where(
          and(
            eq(roundSessionTable.contestantId, input.userId),
            eq(roundTable.disciplineSlug, input.discipline),
            eq(roundSessionTable.isFinished, true),
            eq(contestTable.isOngoing, false),
            dateFilter
              ? gte(contestTable.startDate, dateFilter.toISOString())
              : undefined,
          ),
        )
        .groupBy(
          roundSessionTable.id,
          roundSessionTable.avgMs,
          roundSessionTable.isDnf,
          contestTable.slug,
          contestTable.startDate,
          contestTable.type,
        )
        .orderBy(contestTable.startDate)

      return rows.map((row) => ({
        sessionId: row.sessionId,
        avgMs: row.avgMs,
        isDnf: row.isDnf,
        contestSlug: row.contestSlug,
        contestStartDate: row.contestStartDate,
        contestType: row.contestType,
        bestSingleMs: row.bestSingleMs,
      }))
    }),

  getContestParticipation: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        year: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const yearStart = new Date(input.year, 0, 1)
      const yearEnd = new Date(input.year + 1, 0, 1)

      const rows = await ctx.db
        .select({
          contestSlug: contestTable.slug,
          contestStartDate: contestTable.startDate,
          contestEndDate: contestTable.endDate,
          contestType: contestTable.type,
          sessionId: roundSessionTable.id,
          isFinished: roundSessionTable.isFinished,
          discipline: roundTable.disciplineSlug,
        })
        .from(roundSessionTable)
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
        .where(
          and(
            eq(roundSessionTable.contestantId, input.userId),
            gte(contestTable.startDate, yearStart.toISOString()),
            lt(contestTable.startDate, yearEnd.toISOString()),
            eq(contestTable.isOngoing, false),
          ),
        )
        .orderBy(contestTable.startDate)

      const contestMap = new Map<
        string,
        {
          contestSlug: string
          contestStartDate: string
          contestEndDate: string | null
          contestType: string
          disciplines: Discipline[]
          isCompleted: boolean
          sessionId: number
        }
      >()

      for (const row of rows) {
        const existing = contestMap.get(row.contestSlug)
        if (existing) {
          if (!existing.disciplines.includes(row.discipline as Discipline)) {
            existing.disciplines.push(row.discipline as Discipline)
          }
          if (!row.isFinished) {
            existing.isCompleted = false
          }
        } else {
          contestMap.set(row.contestSlug, {
            contestSlug: row.contestSlug,
            contestStartDate: row.contestStartDate,
            contestEndDate: row.contestEndDate,
            contestType: row.contestType,
            disciplines: [row.discipline as Discipline],
            isCompleted: row.isFinished,
            sessionId: row.sessionId,
          })
        }
      }

      return Array.from(contestMap.values())
    }),

  updateBio: protectedProcedure
    .input(z.object({ bio: z.string().max(500) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(userMetadataTable)
        .values({
          userId: ctx.session.user.id,
          bio: input.bio,
        })
        .onConflictDoUpdate({
          target: userMetadataTable.userId,
          set: { bio: input.bio },
        })
    }),
})
