import { z } from 'zod'

// export type ScrambleDTO = SolveContestStateDTO['currentSolve']['scramble']
export type Discipline = (typeof DISCIPLINES)[number]
//
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
