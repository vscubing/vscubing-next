import { z } from 'zod'

// export type ScrambleDTO = SolveContestStateDTO['currentSolve']['scramble']
export type Discipline = (typeof DISCIPLINES)[number]

export const SCRAMBLE_POSITIONS = ['1', '2', '3', '4', '5', 'E1', 'E2'] as const
export type ScramblePosition = (typeof SCRAMBLE_POSITIONS)[number]
export function isExtra(position: ScramblePosition) {
  return position[0] === 'E'
}

export const SOLVE_STATES = [
  'pending',
  'submitted',
  'changed_to_extra',
] as const
export type SolveState = (typeof SOLVE_STATES)[number]

export type RoundSession = {
  solves: {
    id: number
    timeMs: number | null
    isDnf: boolean
    scramblePosition: ScramblePosition
  }[]
  id: number
  avgMs: number | null
  nickname: string
  isOwn: boolean
}

export type SolveResult =
  | { timeMs: number | null; isDnf: true }
  | { timeMs: number; isDnf: false }

// export type ContestDTO = ContestsContestListOutput['results'][number]
// export type ContestList = ContestsContestListOutput

export const DEFAULT_DISCIPLINE: Discipline = '3by3'
export const DISCIPLINES = ['3by3', '2by2'] as const
export function isDiscipline(str: unknown): str is Discipline {
  return z.enum(DISCIPLINES).safeParse(str).success
}
export function castDiscipline(str: unknown): Discipline {
  return z.enum(DISCIPLINES).catch(DEFAULT_DISCIPLINE).parse(str)
}
