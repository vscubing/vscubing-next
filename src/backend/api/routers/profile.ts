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
        .where(eq(sql`lower(${userTable.name})`, input.username.toLowerCase()))

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

  getProfileStats: publicProcedure
    .input(z.object({ userId: z.string(), createdAt: z.string() }))
    .query(async ({ ctx, input }) => {
      // Count contests where user completed at least 1 discipline
      const [participationResult] = await ctx.db
        .select({ count: countDistinct(roundTable.contestSlug) })
        .from(roundSessionTable)
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
        .where(
          and(
            eq(roundSessionTable.contestantId, input.userId),
            eq(roundSessionTable.isFinished, true),
            eq(contestTable.isOngoing, false),
          ),
        )
      const contestsParticipated = Number(participationResult?.count ?? 0)

      // Calculate current contest streak
      const allContestsDesc = await ctx.db
        .select({ slug: contestTable.slug })
        .from(contestTable)
        .where(eq(contestTable.isOngoing, false))
        .orderBy(desc(contestTable.startDate))

      const participatedContestSlugs = new Set(
        (
          await ctx.db
            .selectDistinct({ contestSlug: roundTable.contestSlug })
            .from(roundSessionTable)
            .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
            .innerJoin(
              contestTable,
              eq(contestTable.slug, roundTable.contestSlug),
            )
            .where(
              and(
                eq(roundSessionTable.contestantId, input.userId),
                eq(roundSessionTable.isFinished, true),
                eq(contestTable.isOngoing, false),
              ),
            )
        ).map((r) => r.contestSlug),
      )

      let currentContestStreak = 0
      for (const contest of allContestsDesc) {
        if (participatedContestSlugs.has(contest.slug)) {
          currentContestStreak++
        } else {
          break
        }
      }

      return {
        createdAt: input.createdAt,
        contestsParticipated,
        currentContestStreak,
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
        discipline: row.discipline,
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

  getContestYears: publicProcedure.query(async ({ ctx }) => {
    const yearCol = sql<number>`EXTRACT(YEAR FROM ${contestTable.startDate})::int`

    const rows = await ctx.db
      .selectDistinct({
        year: yearCol,
      })
      .from(contestTable)
      .orderBy(desc(yearCol))

    return rows.map((r) => r.year)
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
          contestExpectedEndDate: contestTable.expectedEndDate,
          contestType: contestTable.type,
          isOngoing: contestTable.isOngoing,
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
            eq(roundSessionTable.isFinished, true),
            gte(contestTable.startDate, yearStart.toISOString()),
            lt(contestTable.startDate, yearEnd.toISOString()),
          ),
        )
        .orderBy(contestTable.startDate)

      // Get all disciplines per contest to determine completion
      const contestDisciplines = await ctx.db
        .select({
          contestSlug: roundTable.contestSlug,
          discipline: roundTable.disciplineSlug,
        })
        .from(roundTable)
        .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
        .where(
          and(
            gte(contestTable.startDate, yearStart.toISOString()),
            lt(contestTable.startDate, yearEnd.toISOString()),
          ),
        )

      const allDisciplinesPerContest = new Map<string, Set<string>>()
      for (const row of contestDisciplines) {
        const existing = allDisciplinesPerContest.get(row.contestSlug)
        if (existing) {
          existing.add(row.discipline)
        } else {
          allDisciplinesPerContest.set(
            row.contestSlug,
            new Set([row.discipline]),
          )
        }
      }

      const contestMap = new Map<
        string,
        {
          contestSlug: string
          contestStartDate: string
          contestEndDate: string | null
          contestExpectedEndDate: string
          contestType: string
          isOngoing: boolean
          disciplines: Discipline[]
          availableDisciplines: Discipline[]
          isCompleted: boolean
          sessionId: number
        }
      >()

      for (const row of rows) {
        const existing = contestMap.get(row.contestSlug)
        if (existing) {
          if (!existing.disciplines.includes(row.discipline)) {
            existing.disciplines.push(row.discipline)
          }
        } else {
          contestMap.set(row.contestSlug, {
            contestSlug: row.contestSlug,
            contestStartDate: row.contestStartDate,
            contestEndDate: row.contestEndDate,
            contestExpectedEndDate: row.contestExpectedEndDate,
            contestType: row.contestType,
            isOngoing: row.isOngoing,
            disciplines: [row.discipline],
            availableDisciplines: [],
            isCompleted: false,
            sessionId: row.sessionId,
          })
        }
      }

      // A contest is "completed" if the user finished all disciplines available in that contest
      for (const [slug, contest] of contestMap) {
        const totalDisciplines = allDisciplinesPerContest.get(slug)
        contest.availableDisciplines = totalDisciplines
          ? (Array.from(totalDisciplines) as Discipline[])
          : contest.disciplines
        contest.isCompleted =
          !!totalDisciplines &&
          contest.disciplines.length >= totalDisciplines.size
      }

      // Fetch all contests in the year to include non-participated ones
      const allContests = await ctx.db
        .select({
          slug: contestTable.slug,
          startDate: contestTable.startDate,
          endDate: contestTable.endDate,
          expectedEndDate: contestTable.expectedEndDate,
          type: contestTable.type,
          isOngoing: contestTable.isOngoing,
        })
        .from(contestTable)
        .where(
          and(
            gte(contestTable.startDate, yearStart.toISOString()),
            lt(contestTable.startDate, yearEnd.toISOString()),
          ),
        )
        .orderBy(contestTable.startDate)

      for (const contest of allContests) {
        if (!contestMap.has(contest.slug)) {
          const totalDisciplines = allDisciplinesPerContest.get(contest.slug)
          contestMap.set(contest.slug, {
            contestSlug: contest.slug,
            contestStartDate: contest.startDate,
            contestEndDate: contest.endDate,
            contestExpectedEndDate: contest.expectedEndDate,
            contestType: contest.type,
            isOngoing: contest.isOngoing,
            disciplines: [],
            availableDisciplines: totalDisciplines
              ? (Array.from(totalDisciplines) as Discipline[])
              : [],
            isCompleted: false,
            sessionId: 0,
          })
        }
      }

      return Array.from(contestMap.values())
    }),

  updateBio: protectedProcedure
    .input(z.object({ bio: z.string().max(100) }))
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
