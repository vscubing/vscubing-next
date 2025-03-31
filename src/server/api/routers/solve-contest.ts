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
import type { ScramblePosition, SolveState } from '@/app/_types'

export const contestRouter = createTRPCRouter({
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
        .leftJoin(
          roundSessionTable,
          eq(roundSessionTable.contestantId, ctx.session.user.id),
        )
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
        .map(castNonNullableSolveRow)
      const changedToExtraSolveRows = rows
        .filter(({ state }) => state === 'changed_to_extra')
        .map(castNonNullableSolveRow)
      const [pendingSolve] = rows
        .filter(({ state }) => state === 'pending')
        .map(castNonNullableSolveRow)

      return {
        availableExtras: EXTRAS_PER_ROUND - changedToExtraSolveRows.length,
        submittedSolves: submittedSolveRows.map(({ id, timeMs, isDnf }) =>
          castSolveInvariant({ id, timeMs, isDnf }),
        ),
        currentScramble: rows.find(
          ({ state }) => state === null || state === 'pending',
        ),
        pendingSolve: pendingSolve
          ? castSolveInvariant({
              id: pendingSolve.id,
              isDnf: pendingSolve.isDnf,
              timeMs: pendingSolve.timeMs,
            })
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

type NullableSolveRow = {
  scramble: string
  position: ScramblePosition
  id: number | null
  isDnf: boolean | null
  timeMs: number | null
  state: SolveState | null
}
function castNonNullableSolveRow({
  id,
  isDnf,
  position,
  scramble,
  state,
  timeMs,
}: NullableSolveRow) {
  if (id === null || state === null || isDnf === null)
    throw new Error(
      `[SOLVE] invalid solve state: ${JSON.stringify({ id, state, isDnf })}`,
    )

  if (isDnf === false) {
    if (timeMs === null)
      throw new Error(
        `[SOLVE] invalid solve state: ${JSON.stringify({ id, isDnf, timeMs })}`,
      )
    return {
      id: id,
      isDnf: isDnf,
      position: position,
      scramble: scramble,
      state: state,
      timeMs: timeMs,
    }
  }
  return {
    id: id,
    isDnf: isDnf,
    position: position,
    scramble: scramble,
    state: state,
    timeMs: timeMs,
  }
}

function castSolveInvariant({
  id,
  timeMs,
  isDnf,
}: {
  id: number
  timeMs: number | null
  isDnf: boolean
}) {
  if (isDnf === false) {
    if (timeMs === null)
      throw new Error(
        `[SOLVE] invalid solve state: ${JSON.stringify({ id, isDnf, timeMs })}`,
      )
    return { id, timeMs, isDnf }
  }
  return { id, timeMs, isDnf }
}

const EXTRAS_PER_ROUND = 2
