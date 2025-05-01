import { DISCIPLINES, type Discipline } from '@/types'
import { z } from 'zod'
import { eq, and, sql, count } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  roundTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
} from '@/backend/db/schema'
import { resultDnfable, SCRAMBLE_POSITIONS, SOLVE_STATUSES } from '@/types'
import { sortWithRespectToExtras } from '../../shared/sort-with-respect-to-extras'
import { calculateAvg } from '../../shared/calculate-avg'
import { validateSolve } from '@/backend/shared/validate-solve'
import { getContestUserCapabilities } from '../../shared/get-contest-user-capabilities'
import { removeSolutionComments } from '@/lib/utils/remove-solution-comments'
import { getPersonalRecordSolveSubquery } from '@/backend/shared/personal-record'
import { db } from '@/backend/db'
import { decodeSolve } from '@/lib/utils/solve-signature'

const EXTRAS_PER_ROUND = 2
const ROUND_ATTEMPTS_QTY = 5

const submittedSolvesInvariant = z.array(
  z.object(
    {
      scramble: z.object({
        id: z.number(),
        moves: z.string(),
        position: z.enum(SCRAMBLE_POSITIONS),
      }),
      id: z.number(),
      status: z.enum(SOLVE_STATUSES),
      result: resultDnfable,
      isPersonalRecord: z.boolean().default(false),
    },
    {
      message: '[SOLVE] invalid submitted solve invariant',
    },
  ),
)

export const roundSessionAuthProcedure = protectedProcedure
  .input(
    z.object({
      discipline: z.enum(DISCIPLINES),
      contestSlug: z.string(),
    }),
  )
  .use(async ({ next, input, ctx }) => {
    const userCapabilities = await getContestUserCapabilities({
      contestSlug: input.contestSlug,
      discipline: input.discipline,
    })
    if (userCapabilities === 'CONTEST_NOT_FOUND')
      throw new TRPCError({ code: 'NOT_FOUND' })
    if (userCapabilities !== 'SOLVE')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: "You can't participate in a round you've already completed.",
      })

    const roundSubquery = getRoundSubquery({
      contestSlug: input.contestSlug,
      discipline: input.discipline,
    })

    const [roundSession] = await ctx.db
      .select({ id: roundSessionTable.id, roundId: roundSubquery.id })
      .from(roundSubquery)
      .innerJoin(
        roundSessionTable,
        eq(roundSessionTable.roundId, roundSubquery.id),
      )
      .innerJoin(scrambleTable, eq(scrambleTable.roundId, roundSubquery.id))
      .where(eq(roundSessionTable.contestantId, ctx.session.user.id))

    if (roundSession) return next({ ctx: { roundSession } })
    else throw new TRPCError({ code: 'PRECONDITION_FAILED' })
  })

export const roundSessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        contestSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      createRoundSession({
        userId: ctx.session.userId,
        contestSlug: input.contestSlug,
        discipline: input.discipline,
      }),
    ),
  canLeaveRound: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        contestSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) return false

      const [roundSession] = await ctx.db
        .select({ id: roundSessionTable.id })
        .from(roundSessionTable)
        .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
        .where(
          and(
            eq(roundTable.contestSlug, input.contestSlug),
            eq(roundTable.disciplineSlug, input.discipline),
            eq(roundSessionTable.contestantId, ctx.session.user.id),
          ),
        )

      if (!roundSession) return false

      const [solves] = await ctx.db
        .select({ count: count() })
        .from(solveTable)
        .where(and(eq(solveTable.roundSessionId, roundSession.id)))

      return solves?.count === 0
    }),
  leaveRound: roundSessionAuthProcedure.mutation(async ({ ctx }) => {
    const solves = await ctx.db
      .select()
      .from(roundSessionTable)
      .innerJoin(
        solveTable,
        eq(solveTable.roundSessionId, roundSessionTable.id),
      )
      .where(eq(roundSessionTable.id, ctx.roundSession.id))
    if (solves.length > 0) throw new TRPCError({ code: 'FORBIDDEN' })

    await ctx.db
      .delete(roundSessionTable)
      .where(and(eq(roundSessionTable.id, ctx.roundSession.id)))
  }),
  state: roundSessionAuthProcedure.query(async ({ ctx, input }) => {
    const allRows = await ctx.db
      .select({
        scramble: {
          id: scrambleTable.id,
          moves: scrambleTable.moves,
          position: scrambleTable.position,
        },
        result: {
          isDnf: solveTable.isDnf,
          timeMs: solveTable.timeMs,
          plusTwoIncluded: solveTable.plusTwoIncluded,
        },
        id: solveTable.id,
        status: solveTable.status,
      })
      .from(roundSessionTable)
      .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
      .innerJoin(scrambleTable, eq(scrambleTable.roundId, roundTable.id))
      .leftJoin(
        solveTable,
        and(
          eq(solveTable.roundSessionId, roundSessionTable.id),
          eq(solveTable.scrambleId, scrambleTable.id),
        ),
      )
      .where(and(eq(roundSessionTable.id, ctx.roundSession.id)))

    const activePersonalRecord = await getPersonalRecordSolveIncludingOngoing(
      ctx.db,
      ctx.session.user.id,
      input.discipline,
    )

    const extrasUsed = allRows.filter(
      ({ status: state }) => state === 'changed_to_extra',
    ).length

    const notChangedToExtraSolves = sortWithRespectToExtras(
      allRows
        .filter(({ status }) => status !== 'changed_to_extra')
        .map(({ id, result, scramble, status }) => ({
          scramble,
          position: scramble.position,
          id: id!,
          status: status!,
          result: result && resultDnfable.parse(result),
          isPersonalRecord: activePersonalRecord?.id === id,
        })),
    )

    const currentSolveRow = notChangedToExtraSolves.find(
      ({ status }) => status === null || status === 'pending',
    )
    if (!currentSolveRow)
      throw new Error(
        '[SOLVE] no currentSolveRow but also no 5 submitted solves',
      )
    const currentSolve = currentSolveRow.id
      ? {
          id: currentSolveRow.id,
          isPersonalRecord: currentSolveRow.isPersonalRecord,
          result: resultDnfable.parse(currentSolveRow.result),
        }
      : null

    return {
      submittedSolves: submittedSolvesInvariant.parse(
        notChangedToExtraSolves.filter(({ status }) => status === 'submitted'),
      ),
      currentScramble: currentSolveRow.scramble,
      currentSolve,
      canChangeToExtra: EXTRAS_PER_ROUND - extrasUsed > 0,
    }
  }),

  postSolve: roundSessionAuthProcedure
    .input(
      z.object({
        solve: z.string(),
        scrambleId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { solve: payload, signatureMatches } = decodeSolve(input.solve)
      if (!signatureMatches)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You are probably trying to do something nasty, please stop.',
        })

      const [scramble] = await ctx.db
        .select({
          moves: scrambleTable.moves,
          discipline: roundTable.disciplineSlug,
        })
        .from(scrambleTable)
        .innerJoin(roundTable, eq(roundTable.id, scrambleTable.roundId))
        .where(eq(scrambleTable.id, input.scrambleId))
      if (!scramble) throw new TRPCError({ code: 'NOT_FOUND' })

      let isDnf = payload.result.isDnf
      let isValid = true

      if (!isDnf) {
        const { isValid: _isValid, error } = await validateSolve({
          discipline: scramble.discipline,
          scramble: scramble.moves,
          solution: removeSolutionComments(payload.solution),
        })
        if (error || !_isValid) {
          console.error(
            `[SOLVE] invalid solve: ${JSON.stringify(scramble)}\n ${JSON.stringify(payload.solution)}\n ${JSON.stringify(error)}`,
          )
          isValid = false
          isDnf = true
        }
      }

      const activePersonalRecord = await getPersonalRecordSolveIncludingOngoing(
        ctx.db,
        ctx.session.user.id,
        input.discipline,
      )

      const setNewPersonalRecord =
        !isDnf &&
        (!activePersonalRecord?.result ||
          activePersonalRecord.result.isDnf ||
          (payload.result.timeMs &&
            payload.result.timeMs < activePersonalRecord.result.timeMs))

      const [solve] = await ctx.db
        .insert(solveTable)
        .values({
          roundSessionId: ctx.roundSession.id,
          isDnf,
          timeMs: payload.result.timeMs,
          plusTwoIncluded: payload.result.plusTwoIncluded ?? false,
          solution: payload.solution,
          status: 'pending',
          scrambleId: input.scrambleId,
        })
        .returning({ id: solveTable.id })

      if (!solve) throw new Error("couldn't insert a solve")

      ctx.analytics.capture({
        event: 'solve_created',
        distinctId: ctx.session.user.id,
        properties: {
          isValid,
          timeMs: payload.result.timeMs,
          isDnf,
          id: solve.id,
        },
        groups: {
          discipline: input.discipline,
          contest: input.contestSlug,
          round: ctx.roundSession.roundId,
          roundSession: ctx.roundSession.id,
        },
      })

      if (!isValid) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      if (setNewPersonalRecord)
        return {
          setNewPersonalRecord,
          previousPersonalRecord: activePersonalRecord?.result.isDnf
            ? undefined
            : activePersonalRecord,
        }
    }),

  submitSolve: roundSessionAuthProcedure
    .input(
      z.object({
        solveId: z.number(),
        type: z.enum(['submitted', 'changed_to_extra']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sessionFinished, avgMs, isDnf } = await ctx.db.transaction(
        async (t) => {
          await t
            .update(solveTable)
            .set({ status: input.type })
            .where(
              and(
                eq(solveTable.id, input.solveId),
                eq(solveTable.roundSessionId, ctx.roundSession.id),
              ),
            )

          const submittedResults = (
            await t
              .select({ isDnf: solveTable.isDnf, timeMs: solveTable.timeMs })
              .from(solveTable)
              .where(
                and(
                  eq(solveTable.roundSessionId, ctx.roundSession.id),
                  eq(solveTable.status, 'submitted'),
                ),
              )
          ).map((res) => resultDnfable.parse(res))

          const sessionFinished = submittedResults.length === ROUND_ATTEMPTS_QTY
          if (sessionFinished) {
            const { timeMs: avgMs, isDnf } = calculateAvg(submittedResults)
            await t
              .update(roundSessionTable)
              .set({ isFinished: true, avgMs, isDnf })
              .where(eq(roundSessionTable.id, ctx.roundSession.id))
            return { sessionFinished: true, avgMs, isDnf }
          }

          return { sessionFinished: false, avgMs: null }
        },
      )

      ctx.analytics.capture({
        event: 'solve_submitted',
        distinctId: ctx.session.user.id,
        properties: {
          id: input.solveId,
          type: input.type,
        },
        groups: {
          discipline: input.discipline,
          contestSlug: input.contestSlug,
          round: ctx.roundSession.roundId,
          roundSession: ctx.roundSession.id,
        },
      })

      if (sessionFinished) {
        ctx.analytics.capture({
          event: 'round_session_finished',
          distinctId: ctx.session.user.id,
          properties: {
            avgMs,
            isDnf,
          },
          groups: {
            discipline: input.discipline,
            contestSlug: input.contestSlug,
            round: ctx.roundSession.roundId,
            roundSession: ctx.roundSession.id,
          },
        })
      }

      return { sessionFinished }
    }),
})

async function getPersonalRecordSolveIncludingOngoing(
  _db: typeof db,
  userId: string,
  discipline: Discipline,
) {
  const subquery = getPersonalRecordSolveSubquery({
    db: _db,
    discipline,
    includeOngoing: true,
  })
  const [activeBest] = await _db
    .select({
      id: subquery.id,
      result: {
        timeMs: subquery.timeMs,
        isDnf: subquery.isDnf,
        plusTwoIncluded: subquery.plusTwoIncluded,
      },
      contestSlug: roundTable.contestSlug,
    })
    .from(subquery)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.id, subquery.roundSessionId),
    )
    .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
    .where(eq(roundSessionTable.contestantId, userId))

  return activeBest?.result
    ? {
        ...activeBest,
        result: resultDnfable.parse(activeBest?.result),
      }
    : undefined
}

async function createRoundSession({
  userId,
  contestSlug,
  discipline,
}: {
  userId: string
  contestSlug: string
  discipline: Discipline
}) {
  const roundSubquery = getRoundSubquery({ contestSlug, discipline })
  console.log(contestSlug, discipline, userId)
  console.log(
    await db
      .select()
      .from(roundSubquery)
      .where(
        and(
          eq(roundSubquery.disciplineSlug, discipline),
          eq(roundSubquery.contestSlug, contestSlug),
        ),
      ),
  )
  const [roundSession] = await db
    .with(roundSubquery)
    .insert(roundSessionTable)
    .values({
      roundId: sql`(select id from ${roundSubquery})`,
      contestantId: userId,
    })
    .returning({ id: roundSessionTable.id, roundId: roundSubquery.id })

  if (!roundSession) throw new Error("couldn't create a round session")
  return roundSession
}

function getRoundSubquery({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  return db
    .select()
    .from(roundTable)
    .where(
      and(
        eq(roundTable.contestSlug, contestSlug),
        eq(roundTable.disciplineSlug, discipline),
      ),
    )
    .as('subquery')
}
