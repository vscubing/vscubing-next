import { DISCIPLINES } from '@/shared'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  contestDisciplineTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
} from '@/server/db/schema'
import { resultDnfish, SCRAMBLE_POSITIONS, SOLVE_STATES } from '@/app/_types'
import { sortWithRespectToExtras } from './sort-with-respect-to-extras'
import { calculateAvg } from './calculate-avg'
import { validateSolve } from '@/server/internal/validate-solve'
import { removeComments } from '@/app/_utils/remove-solve-comments'
import { getContestUserCapabilities } from '../../internal/get-contest-user-capabilities'

const submittedSolvesInvariant = z.array(
  z.object(
    {
      scramble: z.object({
        id: z.number(),
        moves: z.string(),
        position: z.enum(SCRAMBLE_POSITIONS),
      }),
      id: z.number(),
      state: z.enum(SOLVE_STATES),
      result: resultDnfish,
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

    const contestDisciplineSubquery = ctx.db
      .select()
      .from(contestDisciplineTable)
      .where(
        and(
          eq(contestDisciplineTable.contestSlug, input.contestSlug),
          eq(contestDisciplineTable.disciplineSlug, input.discipline),
        ),
      )
      .as('subquery')

    const [roundSession] = await ctx.db
      .select({ id: roundSessionTable.id })
      .from(contestDisciplineSubquery)
      .innerJoin(
        roundSessionTable,
        eq(roundSessionTable.contestDisciplineId, contestDisciplineSubquery.id),
      )
      .innerJoin(
        scrambleTable,
        eq(scrambleTable.contestDisciplineId, contestDisciplineSubquery.id),
      )
      .where(eq(roundSessionTable.contestantId, ctx.session.user.id))

    if (roundSession) return next({ ctx: { roundSession: roundSession } })

    const [createdRoundSession] = await ctx.db
      .with(contestDisciplineSubquery)
      .insert(roundSessionTable)
      .values({
        contestDisciplineId: sql`(select id from ${contestDisciplineSubquery})`,
        contestantId: ctx.session.user.id,
      })
      .returning({ id: roundSessionTable.id })
    if (!createdRoundSession)
      throw new Error(
        `Error while creating a round session for ${JSON.stringify(input)}`,
      )

    return next({ ctx: { roundSession: createdRoundSession } })
  })

export const roundSessionRouter = createTRPCRouter({
  state: roundSessionAuthProcedure.query(async ({ ctx }) => {
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
        state: solveTable.state,
      })
      .from(contestDisciplineTable)
      .innerJoin(
        scrambleTable,
        eq(scrambleTable.contestDisciplineId, contestDisciplineTable.id),
      )
      .innerJoin(
        roundSessionTable,
        eq(roundSessionTable.contestDisciplineId, contestDisciplineTable.id),
      )
      .leftJoin(solveTable, eq(solveTable.scrambleId, scrambleTable.id))
      .where(eq(roundSessionTable.id, ctx.roundSession.id))

    const extrasUsed = allRows.filter(
      ({ state }) => state === 'changed_to_extra',
    ).length

    const notChangedToExtraSolves = sortWithRespectToExtras(
      allRows
        .filter(({ state }) => state !== 'changed_to_extra')
        .map(({ id, result, scramble, state }) => ({
          scramble,
          position: scramble.position,
          id,
          state,
          result: result && resultDnfish.parse(result),
        })),
    )

    const currentSolveRow = notChangedToExtraSolves.find(
      ({ state }) => state === null || state === 'pending',
    )
    if (!currentSolveRow)
      throw new Error(
        '[SOLVE] no currentSolveRow but also no 5 submitted solves',
      )
    const currentSolve = currentSolveRow.id
      ? {
          id: currentSolveRow.id,
          result: resultDnfish.parse(currentSolveRow.result),
        }
      : null

    return {
      submittedSolves: submittedSolvesInvariant.parse(
        notChangedToExtraSolves.filter(({ state }) => state === 'submitted'),
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
          discipline: contestDisciplineTable.disciplineSlug,
        })
        .from(scrambleTable)
        .innerJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.id, scrambleTable.contestDisciplineId),
        )
        .where(eq(scrambleTable.id, input.scrambleId))
      if (!scramble) throw new TRPCError({ code: 'NOT_FOUND' })

      let isDnf = input.result.isDnf
      let isValid = true

      if (!isDnf) {
        isValid = await validateSolve({
          discipline: scramble.discipline,
          scramble: scramble.moves,
          solution: removeComments(input.solution),
        })
        if (!isValid) isDnf = true
      }

      await ctx.db.insert(solveTable).values({
        roundSessionId: ctx.roundSession.id,
        isDnf,
        timeMs: input.result.timeMs,
        solution: input.solution,
        state: 'pending',
        scrambleId: input.scrambleId,
      })

      if (!isValid) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),

  submitSolve: roundSessionAuthProcedure
    .input(
      z.object({
        solveId: z.number(),
        type: z.enum(['submitted', 'changed_to_extra']),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (t) => {
        await t
          .update(solveTable)
          .set({ state: input.type })
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
                eq(solveTable.state, 'submitted'),
              ),
            )
        ).map((res) => resultDnfish.parse(res))

        if (submittedResults.length === ROUND_ATTEMPTS_QTY) {
          const { timeMs: avgMs, isDnf } = calculateAvg(submittedResults)
          await t
            .update(roundSessionTable)
            .set({ isFinished: true, avgMs, isDnf })
            .where(eq(roundSessionTable.id, ctx.roundSession.id))
        }
      }),
    ),
})

const DISCIPLINE_TO_KPUZZLE: Record<Discipline, string> = {
  '3by3': '3x3x3',
  '2by2': '2x2x2',
}

const EXTRAS_PER_ROUND = 2
const ROUND_ATTEMPTS_QTY = 5
