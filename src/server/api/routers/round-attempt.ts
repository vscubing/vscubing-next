import { DISCIPLINES } from '@/shared'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
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
  SCRAMBLE_POSITIONS,
  SOLVE_STATES,
  type ScramblePosition,
  type SolveResult,
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

const solveInvariant = z.custom<// TODO: check if this works
SolveResult>(
  (input) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (input.isDnf === false && input.timeMs === null) return false
    return true
  },
  {
    message: '[SOLVE] invalid state',
  },
)

export const roundAttempt = createTRPCRouter({
  state: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        contestSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
        .leftJoin(solveTable, eq(solveTable.scrambleId, scrambleTable.id))
        .where(
          and(
            eq(contestDisciplineTable.contestSlug, input.contestSlug),
            eq(contestDisciplineTable.disciplineSlug, input.discipline),
          ),
        )

      allRows.sort(
        (a, b) =>
          positionComparator(a.position) - positionComparator(b.position),
      )

      const extrasUsed = allRows.filter(
        ({ state }) => state === 'changed_to_extra',
      ).length
      const resultRows = allRows.filter(({ position }) => !isExtra(position)) // also the first 5 elements of allRows

      {
        const extras = allRows.filter(({ position }) => isExtra(position))

        let nextExtraIdx: number | null = 0
        for (let idx = 0; idx < ROUND_ATTEMPTS_QTY; idx++) {
          if (resultRows[idx]?.state !== 'changed_to_extra') continue
          if (nextExtraIdx === null)
            throw new Error('[SOLVE] Too many changed_to_extra solves!')

          resultRows[idx] = extras[nextExtraIdx]!
          if (nextExtraIdx === 0) nextExtraIdx = 1
          else if (nextExtraIdx === 1) nextExtraIdx = null
        }
      }

      const submittedSolveRows = resultRows
        .filter(({ state }) => state === 'submitted')
        .map((row) => solveRowInvariant.parse(row))

      if (submittedSolveRows.length === ROUND_ATTEMPTS_QTY) {
        const [roundSession] = await ctx.db // TODO: can we do this in the update?
          .select({ id: roundSessionTable.id })
          .from(roundSessionTable)
          .innerJoin(
            contestDisciplineTable,
            eq(
              contestDisciplineTable.id,
              roundSessionTable.contestDisciplineId,
            ),
          )
          .where(
            and(
              eq(contestDisciplineTable.contestSlug, input.contestSlug),
              eq(contestDisciplineTable.disciplineSlug, input.discipline),
            ),
          )
        const { avgMs, isDnf } = calculateAvg(submittedSolveRows)
        await ctx.db
          .update(roundSessionTable)
          .set({ isFinished: true, avgMs, isDnf })
          .where(eq(roundSessionTable.id, roundSession!.id))
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You can't participate in a round you've already completed.",
        })
      }

      const currentSolveRow = resultRows.find(
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
            ...solveInvariant.parse({ id, timeMs, isDnf }),
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
                ...solveInvariant.parse({
                  isDnf: currentSolveRow.isDnf,
                  timeMs: currentSolveRow.timeMs,
                }),
              }
            : null,
        canChangeToExtra: EXTRAS_PER_ROUND - extrasUsed > 0,
      }
    }),

  postSolve: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        contestSlug: z.string(),
        solve: solveInvariant,
        solution: z.string(),
        scrambleId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

      const contestDisciplineId = (
        await ctx.db
          .select({ id: contestDisciplineTable.id })
          .from(contestDisciplineTable)
          .where(
            and(
              eq(contestDisciplineTable.contestSlug, input.contestSlug),
              eq(contestDisciplineTable.disciplineSlug, input.discipline),
            ),
          )
      )[0]!.id

      let roundSessionId = (
        await ctx.db // TODO: can we retrieve this during insertion?
          .select({ id: roundSessionTable.id })
          .from(roundSessionTable)
          .innerJoin(
            contestDisciplineTable,
            eq(
              contestDisciplineTable.id,
              roundSessionTable.contestDisciplineId,
            ),
          )
          .innerJoin(
            scrambleTable,
            eq(scrambleTable.contestDisciplineId, contestDisciplineTable.id),
          )
          .where(
            and(
              eq(contestDisciplineTable.contestSlug, input.contestSlug),
              eq(contestDisciplineTable.disciplineSlug, input.discipline),
              eq(scrambleTable.id, input.scrambleId),
            ),
          )
      )[0]?.id

      if (!roundSessionId) {
        const [roundSession] = await ctx.db
          .insert(roundSessionTable)
          .values({ contestDisciplineId, contestantId: ctx.session.user.id })
          .returning({ id: roundSessionTable.id })
        roundSessionId = roundSession!.id
      }

      await ctx.db.insert(solveTable).values({
        // TODO: check for a conflict error
        roundSessionId,
        isDnf: input.solve.isDnf,
        timeMs: input.solve.timeMs,
        solution: input.solution,
        state: 'pending',
        scrambleId: input.scrambleId,
      })
    }),

  submitSolve: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        contestSlug: z.string(),
        solveId: z.number(),
        newState: z.enum(['submitted', 'changed_to_extra']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

      // TODO: close attempt

      await ctx.db
        .update(solveTable)
        .set({ state: input.newState })
        .where(eq(solveTable.id, input.solveId))
    }),
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

function swap<T>(arr: T[], i1: number, i2: number) {
  const temp = arr[i1]
  arr[i1] = arr[i2]!
  arr[i2] = temp!
}
function calculateAvg( // TODO:
  _submittedSolveRows: {
    scrambleMoves: string
    position: '1' | '2' | '3' | '4' | '5' | 'E1' | 'E2'
    id: number
    isDnf: boolean
    timeMs: number | null
    state: 'pending' | 'submitted' | 'changed_to_extra'
  }[],
): { avgMs: number; isDnf: boolean } {
  return { avgMs: 1000, isDnf: false }
}

const ROUND_ATTEMPTS_QTY = 5
