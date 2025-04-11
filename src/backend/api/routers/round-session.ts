import { DISCIPLINES, type Discipline } from '@/types'
import { z } from 'zod'
import { eq, and, sql, or } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  roundTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
} from '@/backend/db/schema'
import { resultDnfish, SCRAMBLE_POSITIONS, SOLVE_STATUSES } from '@/types'
import { sortWithRespectToExtras } from '../../shared/sort-with-respect-to-extras'
import { calculateAvg } from '../../shared/calculate-avg'
import { validateSolve } from '@/backend/shared/validate-solve'
import { getContestUserCapabilities } from '../../shared/get-contest-user-capabilities'
import { removeSolutionComments } from '@/utils/remove-solution-comments'
import type { db } from '@/backend/db'

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
      result: resultDnfish,
      isPersonalBest: z.boolean().default(false),
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

    const roundSubquery = ctx.db
      .select()
      .from(roundTable)
      .where(
        and(
          eq(roundTable.contestSlug, input.contestSlug),
          eq(roundTable.disciplineSlug, input.discipline),
        ),
      )
      .as('subquery')

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

    const [createdRoundSession] = await ctx.db
      .with(roundSubquery)
      .insert(roundSessionTable)
      .values({
        roundId: sql`(select id from ${roundSubquery})`,
        contestantId: ctx.session.user.id,
      })
      .returning({ id: roundSessionTable.id, roundId: roundSubquery.id })
    if (!createdRoundSession)
      throw new Error(
        `Error while creating a round session for ${JSON.stringify(input)}`,
      )

    ctx.analytics.groupIdentify({
      groupType: 'roundSession',
      groupKey: String(createdRoundSession.id),
      distinctId: ctx.session.user.id,
      properties: {
        discipline: input.discipline,
        contest: input.contestSlug,
        roundId: createdRoundSession.roundId,
      },
    })
    return next({ ctx: { roundSession: createdRoundSession } })
  })

export const roundSessionRouter = createTRPCRouter({
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

    const activePersonalBest = await getPersonalBest(
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
          result: result && resultDnfish.parse(result),
          isPersonalBest: activePersonalBest?.id === id,
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
          isPersonalBest: currentSolveRow.isPersonalBest,
          result: resultDnfish.parse(currentSolveRow.result),
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
        result: resultDnfish,
        solution: z.string(),
        scrambleId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [scramble] = await ctx.db
        .select({
          moves: scrambleTable.moves,
          discipline: roundTable.disciplineSlug,
        })
        .from(scrambleTable)
        .innerJoin(roundTable, eq(roundTable.id, scrambleTable.roundId))
        .where(eq(scrambleTable.id, input.scrambleId))
      if (!scramble) throw new TRPCError({ code: 'NOT_FOUND' })

      let isDnf = input.result.isDnf
      let isValid = true

      if (!isDnf) {
        const { isValid: _isValid, error } = await validateSolve({
          discipline: scramble.discipline,
          scramble: scramble.moves,
          solution: removeSolutionComments(input.solution),
        })
        if (error || !_isValid) {
          console.error(
            `[SOLVE] invalid solve: ${JSON.stringify(scramble)}\n ${JSON.stringify(input.solution)}\n ${JSON.stringify(error)}`,
          )
          isValid = false
          isDnf = true
        }
      }

      const activePersonalBest = await getPersonalBest(
        ctx.db,
        ctx.session.user.id,
        input.discipline,
      )

      const setNewPersonalBest = !!(
        activePersonalBest?.timeMs &&
        !isDnf &&
        isValid &&
        input.result.timeMs &&
        input.result.timeMs < activePersonalBest.timeMs
      )

      const [solve] = await ctx.db
        .insert(solveTable)
        .values({
          roundSessionId: ctx.roundSession.id,
          isDnf,
          timeMs: input.result.timeMs,
          solution: input.solution,
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
          timeMs: input.result.timeMs,
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

      if (setNewPersonalBest)
        return {
          setNewPersonalBest,
          previousPersonalBest: {
            ...activePersonalBest,
            timeMs: activePersonalBest.timeMs!,
          },
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
          ).map((res) => resultDnfish.parse(res))

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
    }),
})

async function getPersonalBest(
  _db: typeof db,
  userId: string,
  discipline: Discipline,
) {
  const [activePersonalBest] = await _db
    .select({
      id: solveTable.id,
      timeMs: solveTable.timeMs,
      contestSlug: roundTable.contestSlug,
    })
    .from(solveTable)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.id, solveTable.roundSessionId),
    )
    .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
    .where(
      and(
        eq(roundSessionTable.contestantId, userId),
        eq(roundTable.disciplineSlug, discipline),
        eq(solveTable.isDnf, false),
        or(
          eq(solveTable.status, 'submitted'),
          eq(solveTable.status, 'pending'),
        ),
      ),
    )
    .orderBy(solveTable.timeMs)
    .limit(1)
  return activePersonalBest
}
