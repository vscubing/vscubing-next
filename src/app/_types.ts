import { z } from 'zod'

// export type ScrambleDTO = SolveContestStateDTO['currentSolve']['scramble']
export type Discipline = (typeof DISCIPLINES)[number]

export const SCRAMBLE_POSITIONS = ['1', '2', '3', '4', '5', 'E1', 'E2'] as const
export type ScramblePosition = (typeof SCRAMBLE_POSITIONS)[number]
export function isExtra(position: ScramblePosition) {
  return position.startsWith('E')
}

export const SOLVE_STATES = [
  'pending',
  'submitted',
  'changed_to_extra',
] as const
export type SolveState = (typeof SOLVE_STATES)[number]

export type ContestResultRoundSession = {
  solves: {
    id: number
    scramblePosition: ScramblePosition
    result: ResultDnfish
  }[]
  id: number
  avgMs: number | null
  nickname: string
  isOwn: boolean
}

export type ResultDnfish = ResultSuccess | ResultDnf
type ResultSuccess = { timeMs: number; isDnf: false }
type ResultDnf = { timeMs: null | number; isDnf: true }

export const resultDnfish = z.custom<// TODO: check if this works
ResultDnfish>(
  ({ isDnf, timeMs }: { isDnf: boolean; timeMs: number | null }) => {
    if ((isDnf === false && timeMs !== null) || isDnf === true) return true
    return false
  },
  {
    message: 'Invalid resultDnfish',
  },
)

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
