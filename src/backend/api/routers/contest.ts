import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/backend/api/trpc'
import {
  contestTable,
  disciplineTable,
  roundSessionTable,
  roundTable,
  scrambleTable,
  solveTable,
  userTable,
} from '@/backend/db/schema'
import { getGlobalRecordsByUser } from '@/backend/shared/global-record'
import { getPersonalRecordSolveSubquery } from '@/backend/shared/personal-record'
import { getWcaIdSubquery } from '@/backend/shared/wca-id-subquery'
import {
  CONTEST_TYPES,
  CONTEST_UNAUTHORIZED_MESSAGE,
  DISCIPLINES,
  resultDnfable,
  type RoundSession,
} from '@/types'
import { groupBy } from '@/utils/group-by'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, lte } from 'drizzle-orm'
import { getContestUserCapabilities } from '../../shared/get-contest-user-capabilities'
import { sortWithRespectToExtras } from '../../shared/sort-with-respect-to-extras'

export const contestRouter = createTRPCRouter({
  getAllContests: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES).optional(),
        cursor: z.string().optional(),
        type: z.enum(CONTEST_TYPES),
        limit: z.number().min(1).default(15),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .selectDistinctOn([contestTable.startDate, roundTable.id], {
          slug: contestTable.slug,
          startDate: contestTable.startDate,
          expectedEndDate: contestTable.expectedEndDate,
          endDate: contestTable.endDate,
          isOngoing: contestTable.isOngoing,
        })
        .from(contestTable)
        .innerJoin(roundTable, eq(roundTable.contestSlug, contestTable.slug))
        .innerJoin(
          disciplineTable,
          eq(roundTable.disciplineSlug, disciplineTable.slug),
        )
        .where(
          and(
            eq(contestTable.type, input.type),
            input.discipline
              ? eq(disciplineTable.slug, input.discipline)
              : undefined,
            input.cursor
              ? lte(contestTable.startDate, input.cursor)
              : undefined,
          ),
        )
        .orderBy(desc(contestTable.startDate), roundTable.id)
        .limit(input.limit + 1)

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        nextCursor = items.pop()?.startDate
      }

      return { items, nextCursor }
    }),

  getOngoing: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        slug: contestTable.slug,
        startDate: contestTable.startDate,
        expectedEndDate: contestTable.expectedEndDate,
        endDate: contestTable.endDate,
        isOngoing: contestTable.isOngoing,
        discipline: {
          slug: roundTable.disciplineSlug,
          roundSessionFinished: roundSessionTable.isFinished,
        },
      })
      .from(contestTable)
      .innerJoin(roundTable, eq(roundTable.contestSlug, contestTable.slug))
      .leftJoin(
        roundSessionTable,
        and(
          eq(roundSessionTable.contestantId, ctx.session?.user?.id ?? ''),
          eq(roundSessionTable.roundId, roundTable.id),
        ),
      )
      .innerJoin(
        disciplineTable,
        eq(disciplineTable.slug, roundTable.disciplineSlug),
      )
      .where(
        and(eq(contestTable.isOngoing, true), eq(contestTable.type, 'weekly')),
      )
      .orderBy(disciplineTable.createdAt)

    const ongoing = rows[0]
    if (!ongoing) return null

    return {
      slug: ongoing.slug,
      startDate: ongoing.startDate,
      expectedEndDate: ongoing.expectedEndDate,
      endDate: ongoing.endDate,
      disciplines: rows.map(({ discipline }) => ({
        slug: discipline.slug,
        capabilities: discipline.roundSessionFinished
          ? ('results' as const)
          : ('solve' as const),
      })),
    }
  }),

  getContestMetaData: publicProcedure
    .input(z.object({ contestSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          slug: contestTable.slug,
          startDate: contestTable.startDate,
          expectedEndDate: contestTable.expectedEndDate,
          endDate: contestTable.endDate,
          isOngoing: contestTable.isOngoing,
          disciplineSlug: roundTable.disciplineSlug,
        })
        .from(contestTable)
        .innerJoin(roundTable, eq(roundTable.contestSlug, input.contestSlug))
        .innerJoin(
          disciplineTable,
          eq(disciplineTable.slug, roundTable.disciplineSlug),
        )
        .where(eq(contestTable.slug, input.contestSlug))
        .orderBy(disciplineTable.createdAt)

      const firstRow = rows[0]
      if (!firstRow)
        throw new TRPCError({
          code: 'NOT_FOUND',
        })

      const { slug, startDate, expectedEndDate, endDate, isOngoing } = firstRow
      return {
        slug,
        startDate,
        expectedEndDate,
        endDate,
        isOngoing,
        disciplines: rows.map(({ disciplineSlug }) => disciplineSlug),
      }
    }),

  getContestResults: publicProcedure
    .input(
      z.object({
        contestSlug: z.string(),
        discipline: z.enum(DISCIPLINES),
      }),
    )
    .query(async ({ ctx, input }): Promise<RoundSession[]> => {
      const userCapabilities = await getContestUserCapabilities({
        contestSlug: input.contestSlug,
        discipline: input.discipline,
      })
      if (userCapabilities === 'CONTEST_NOT_FOUND')
        throw new TRPCError({ code: 'NOT_FOUND' })

      if (userCapabilities === 'UNAUTHORIZED')
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: CONTEST_UNAUTHORIZED_MESSAGE,
        })
      if (userCapabilities === 'SOLVE')
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You can't see the results of an ongoing contest round before finishing it",
        })

      const bestSolveSubquery = getPersonalRecordSolveSubquery({
        db: ctx.db,
        discipline: input.discipline,
        includeOngoing: true,
      })
      const wcaIdSubquery = getWcaIdSubquery({ db: ctx.db })

      const queryRes = await ctx.db
        .select({
          session: {
            id: roundSessionTable.id,
            timeMs: roundSessionTable.avgMs,
            isDnf: roundSessionTable.isDnf,
          },
          solve: {
            timeMs: solveTable.timeMs,
            isDnf: solveTable.isDnf,
            plusTwoIncluded: solveTable.plusTwoIncluded,
            id: solveTable.id,
            position: scrambleTable.position,
            personalRecordId: bestSolveSubquery.id,
          },
          user: {
            name: userTable.name,
            id: userTable.id,
            wcaId: wcaIdSubquery.wcaId,
            role: userTable.role,
          },
        })
        .from(roundTable)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.roundId, roundTable.id),
        )
        .innerJoin(
          solveTable,
          eq(solveTable.roundSessionId, roundSessionTable.id),
        )
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .leftJoin(bestSolveSubquery, eq(bestSolveSubquery.id, solveTable.id))
        .leftJoin(wcaIdSubquery, eq(wcaIdSubquery.userId, userTable.id))
        .where(
          and(
            eq(roundTable.contestSlug, input.contestSlug),
            eq(roundTable.disciplineSlug, input.discipline),
            eq(roundSessionTable.isFinished, true),
            eq(solveTable.status, 'submitted'),
          ),
        )
        .orderBy(roundSessionTable.avgMs)

      const solvesBySessionId = groupBy(queryRes, ({ session }) => session.id)
      const globalRecordsByUser = await getGlobalRecordsByUser()

      return Array.from(solvesBySessionId.values()).map((session) => ({
        session: {
          result: resultDnfable.parse(session[0]!.session),
          id: session[0]!.session.id,
          isOwn: session[0]!.user.id === ctx.session?.user.id,
        },
        solves: sortWithRespectToExtras(
          session.map(
            ({
              solve: {
                id,
                personalRecordId,
                position,
                isDnf,
                timeMs,
                plusTwoIncluded,
              },
            }) => ({
              id,
              position,
              result: resultDnfable.parse({ timeMs, isDnf, plusTwoIncluded }),
              isPersonalRecord: id === personalRecordId,
            }),
          ),
        ),
        user: {
          ...session[0]!.user,
          globalRecords: globalRecordsByUser.get(session[0]!.user.id) ?? null,
        },
        contestSlug: input.contestSlug,
      }))
    }),

  getSolve: publicProcedure
    .input(
      z.object({
        solveId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [round] = await ctx.db
        .select({
          discipline: roundTable.disciplineSlug,
          contestSlug: roundTable.contestSlug,
        })
        .from(solveTable)
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .where(eq(solveTable.id, input.solveId))
      if (!round) throw new TRPCError({ code: 'NOT_FOUND' })

      const userCapabilities = await getContestUserCapabilities({
        contestSlug: round.contestSlug,
        discipline: round.discipline,
      })

      const personalRecordSubquery = getPersonalRecordSolveSubquery({
        db: ctx.db,
        discipline: round.discipline,
        includeOngoing: true,
      })

      const [solve] = await ctx.db
        .select({
          scramble: scrambleTable.moves,
          position: scrambleTable.position,
          solution: solveTable.solution,
          personalRecordId: personalRecordSubquery.id,
          user: {
            name: userTable.name,
            id: userTable.id,
          },
          timeMs: solveTable.timeMs,
          discipline: roundTable.disciplineSlug,
          roundSessionId: roundSessionTable.id,
        })
        .from(solveTable)
        .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
        .innerJoin(
          roundSessionTable,
          eq(roundSessionTable.id, solveTable.roundSessionId),
        )
        .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .leftJoin(
          personalRecordSubquery,
          eq(personalRecordSubquery.id, solveTable.id),
        )
        .where(eq(solveTable.id, input.solveId))

      if (!solve) throw new TRPCError({ code: 'NOT_FOUND' })

      if (!solve.solution || !solve.timeMs)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The solve exists, but it is incomplete. \nSolution: ${solve.solution} \ntimeMs: ${solve.timeMs} \nscramble: ${solve.scramble}`,
        })

      return {
        userCapabilities,
        solve: {
          ...solve,
          isPersonalRecord: solve.personalRecordId !== null,
          solution: solve.solution, // reassign to make typescript infer non-nullability
          timeMs: solve.timeMs,
          isOwn: solve.user.id === ctx.session?.user.id,
        },
      }
    }),
})
