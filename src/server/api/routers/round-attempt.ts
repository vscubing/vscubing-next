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
  SCRAMBLE_POSITIONS,
  SOLVE_STATES,
  type ScramblePosition,
  type SolveResult,
} from '@/app/_types'

const solveRowInvariant = z.object(
  {
    scramble: z.string(),
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

      const unsortedRows = await ctx.db
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

      const rows = unsortedRows.sort(
        (a, b) =>
          positionComparator(a.position) - positionComparator(b.position),
      )

      const submittedSolveRows = rows
        .filter(({ state }) => state === 'submitted')
        .map((row) => solveRowInvariant.parse(row))
      {
        let nextExtra: 'E1' | 'E2' | null = 'E1'
        for (let idx = 0; idx < submittedSolveRows.length; idx++) {
          if (submittedSolveRows[idx]?.state !== 'changed_to_extra') continue
          if (!nextExtra)
            throw new Error('[SOLVE] Too many changed_to_extra solves!')
          const extraIdx = submittedSolveRows.findIndex(
            ({ position }) => position === nextExtra,
          )
          swap(submittedSolveRows, idx, extraIdx)
          if (nextExtra === 'E1') nextExtra = 'E2'
          if (nextExtra === 'E2') nextExtra = null
        }
      }

      const currentSolveRow = rows.find(
        ({ state }) => state === null || state === 'pending',
      )
      if (!currentSolveRow)
        throw new Error(`[SOLVE] Invalid state: ${JSON.stringify(rows)}`)

      const extrasUsed = rows.filter(
        ({ state }) => state === 'changed_to_extra',
      ).length

      return {
        submittedSolves: submittedSolveRows.map(
          ({ id, position, scramble, timeMs, isDnf }) => ({
            id,
            position,
            scramble,
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

      const [roundSession] = await ctx.db // TODO: can we retrieve this during insertion?
        .select({ id: roundSessionTable.id })
        .from(roundSessionTable)
        .innerJoin(
          contestDisciplineTable,
          eq(contestDisciplineTable.id, roundSessionTable.contestDisciplineId),
        )
        .innerJoin(scrambleTable, eq(scrambleTable.id, input.scrambleId))
        .where(
          and(
            eq(contestDisciplineTable.contestSlug, input.contestSlug),
            eq(contestDisciplineTable.disciplineSlug, input.discipline),
          ),
        )

      if (!roundSession)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Either you can't solve the scramble ${input.scrambleId} right now or it belongs to a different round.`,
        })

      ctx.db.insert(solveTable).values({
        // TODO: check for a conflict error
        roundSessionId: roundSession.id,
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
