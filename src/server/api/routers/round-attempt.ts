import { DISCIPLINES } from '@/shared'
import { z } from 'zod'
import { eq, and, sql, count } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { getContestUserCapabilities } from './contest'
import { TRPCError } from '@trpc/server'
import {
  contestDisciplineTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
} from '@/server/db/schema'
import {
  isExtra,
  resultDnfish,
  SCRAMBLE_POSITIONS,
  SOLVE_STATES,
  type ResultDnfish,
  type ScramblePosition,
} from '@/app/_types'

const solveRowInvariant = z.object(
  {
    scrambleMoves: z.string(),
    position: z.enum(SCRAMBLE_POSITIONS),
    id: z.number(),
    isDnf: z.boolean(),
    timeMs: z.number().nullable(),
    state: z.enum(SOLVE_STATES),
  },
  {
    message: '[SOLVE] invalid state',
  },
)

export const roundAttemptAuthProcedure = protectedProcedure
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

    const [roundAttempt] = await ctx.db
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

    if (roundAttempt) return next({ ctx: { roundAttempt } })

    const [createdRoundAttempt] = await ctx.db
      .with(contestDisciplineSubquery)
      .insert(roundSessionTable)
      .values({
        contestDisciplineId: sql`(select id from ${contestDisciplineSubquery})`,
        contestantId: ctx.session.user.id,
      })
      .returning({ id: roundSessionTable.id })
    if (!createdRoundAttempt)
      throw new Error(
        `Error while creating a round attempt for ${JSON.stringify(input)}`,
      )

    return next({ ctx: { roundAttempt: createdRoundAttempt } })
  })

export const roundAttempt = createTRPCRouter({
  state: roundAttemptAuthProcedure.query(async ({ ctx }) => {
    const allRows = await ctx.db
      .select({
        scrambleMoves: scrambleTable.moves,
        scrambleId: scrambleTable.id,
        position: scrambleTable.position,
        id: solveTable.id,
        isDnf: solveTable.isDnf,
        timeMs: solveTable.timeMs,
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
      .where(eq(roundSessionTable.id, ctx.roundAttempt.id))

    allRows.sort(
      (a, b) => positionComparator(a.position) - positionComparator(b.position),
    )

    const extrasUsed = allRows.filter(
      ({ state }) => state === 'changed_to_extra',
    ).length

    // usedRows contains the 5 used session's rows in order (change_to_extra'd solves are replaced with extras)
    const usedRows = allRows.filter(({ position }) => !isExtra(position))
    {
      const extras = allRows.filter(({ position }) => isExtra(position))

      let nextExtraIdx: number | null = 0
      for (let idx = 0; idx < ROUND_ATTEMPTS_QTY; idx++) {
        if (usedRows[idx]?.state !== 'changed_to_extra') continue
        if (nextExtraIdx === null)
          throw new Error('[SOLVE] Too many changed_to_extra solves!')

        usedRows[idx] = extras[nextExtraIdx]!
        if (nextExtraIdx === 0) nextExtraIdx = 1
        else if (nextExtraIdx === 1) nextExtraIdx = null
      }
    }

    const submittedSolveRows = usedRows
      .filter(({ state }) => state === 'submitted')
      .map((row) => solveRowInvariant.parse(row))

    const currentSolveRow = usedRows.find(
      ({ state }) => state === null || state === 'pending',
    )
    if (!currentSolveRow)
      throw new Error(
        '[SOLVE] no currentSolveRow but also no 5 submitted solves',
      )

    return {
      submittedSolves: submittedSolveRows.map(
        ({ id, position, scrambleMoves, timeMs, isDnf }) => ({
          id,
          position,
          scramble: scrambleMoves,
          result: resultDnfish.parse({ timeMs, isDnf }),
        }),
      ),
      currentScramble: {
        id: currentSolveRow.scrambleId,
        position: currentSolveRow.position,
        moves: currentSolveRow.scrambleMoves,
      },
      currentSolve:
        currentSolveRow.timeMs &&
        currentSolveRow.id &&
        currentSolveRow.isDnf !== null
          ? {
              id: currentSolveRow.id,
              result: resultDnfish.parse({
                isDnf: currentSolveRow.isDnf,
                timeMs: currentSolveRow.timeMs,
              }),
            }
          : null,
      canChangeToExtra: EXTRAS_PER_ROUND - extrasUsed > 0,
    }
  }),

  postSolve: roundAttemptAuthProcedure
    .input(
      z.object({
        result: resultDnfish,
        solution: z.string(),
        scrambleId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(solveTable).values({
        roundSessionId: ctx.roundAttempt.id,
        isDnf: input.result.isDnf,
        timeMs: input.result.timeMs,
        solution: input.solution,
        state: 'pending',
        scrambleId: input.scrambleId,
      })
    }),

  submitSolve: roundAttemptAuthProcedure
    .input(
      z.object({
        solveId: z.number(),
        newState: z.enum(['submitted', 'changed_to_extra']),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (t) => {
        // TODO: .where(userId)
        await t
          .update(solveTable)
          .set({ state: input.newState })
          .where(eq(solveTable.id, input.solveId))

        const submittedResults = await t
          .select({ isDnf: solveTable.isDnf, timeMs: solveTable.timeMs })
          .from(solveTable)
          .where(eq(solveTable.roundSessionId, ctx.roundAttempt.id))

        if (submittedResults.length === ROUND_ATTEMPTS_QTY) {
          const { timeMs: avgMs, isDnf } = calculateAvg(submittedResults)
          await t
            .update(roundSessionTable)
            .set({ isFinished: true, avgMs, isDnf })
            .where(eq(roundSessionTable.id, ctx.roundAttempt.id))
        }
      }),
    ),
})

function positionComparator(position: ScramblePosition): number {
  switch (position) {
    case '1':
      return 1
    case '2':
      return 2
    case '3':
      return 3
    case '4':
      return 4
    case '5':
      return 5
    case 'E1':
      return 6
    case 'E2':
      return 7
  }
}

const EXTRAS_PER_ROUND = 2
const ROUND_ATTEMPTS_QTY = 5
const MIN_SUCCESSES_NECESSARY = 3

// TODO: unit test
function calculateAvg(
  results: {
    isDnf: boolean
    timeMs: number | null
  }[],
): ResultDnfish {
  const successes = results
    .map(({ timeMs }) => timeMs)
    .filter(Boolean) as number[]
  if (successes.length < ROUND_ATTEMPTS_QTY - 1)
    return { timeMs: null, isDnf: true }
  successes.sort((a, b) => a - b)
  return {
    timeMs: Math.floor(
      successes
        .slice(1, 1 + MIN_SUCCESSES_NECESSARY)
        .reduce((a, b) => a + b, 0) / MIN_SUCCESSES_NECESSARY,
    ),
    isDnf: false,
  }
}
