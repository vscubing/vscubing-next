import { DISCIPLINES } from '@/shared'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { getContestUserCapabilities } from './contest'
import { TRPCError } from '@trpc/server'
import {
  contestDisciplineTable,
  scrambleTable,
  solveTable,
} from '@/server/db/schema'
import {
  SCRAMBLE_POSITIONS,
  SOLVE_STATES,
  type ScramblePosition,
} from '@/app/_types'

export const contestRoundAttempt = createTRPCRouter({
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
      if (userCapabilities !== 'SOLVE')
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You can't solve a round you've already finished.",
        })

      const unsortedRows = await ctx.db
        .select({
          scramble: scrambleTable.moves,
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
      const changedToExtraSolveRows = rows
        .filter(({ state }) => state === 'changed_to_extra')
        .map((row) => solveRowInvariant.parse(row))
      const [pendingSolve] = rows
        .filter(({ state }) => state === 'pending')
        .map((row) => solveRowInvariant.parse(row))

      const currentSolveRow = rows.find(
        ({ state }) => state === null || state === 'pending',
      )
      if (!currentSolveRow)
        throw new Error(`[SOLVE] Invalid state: ${JSON.stringify(rows)}`)

      return {
        availableExtras: EXTRAS_PER_ROUND - changedToExtraSolveRows.length,
        submittedSolves: submittedSolveRows.map(({ id, timeMs, isDnf }) => ({
          id,
          ...solveInvariant.parse({ id, timeMs, isDnf }),
        })),
        currentScramble: currentSolveRow.scramble,
        pendingSolve: pendingSolve
          ? {
              id: pendingSolve.id,
              ...solveInvariant.parse({
                isDnf: pendingSolve.isDnf,
                timeMs: pendingSolve.timeMs,
              }),
            }
          : undefined,
      }
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

const solveInvariant = z.custom<
  // TODO: check if this works
  { timeMs: number | null; isDnf: true } | { timeMs: number; isDnf: false }
>(
  (input) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (input.isDnf === false && input.timeMs === null) return false
    return true
  },
  {
    message: '[SOLVE] invalid state',
  },
)

const EXTRAS_PER_ROUND = 2
