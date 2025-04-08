import type { User, userSimulatorSettingsTable } from '@/server/db/schema'
import { z } from 'zod'

export type { User }
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

export type ResultDnfish = ResultSuccess | ResultDnf
type ResultSuccess = { timeMs: number; isDnf: false }
type ResultDnf = { timeMs: null | number; isDnf: true }

export const resultDnfish = z.custom<ResultDnfish>(
  ({ isDnf, timeMs }: { isDnf: boolean; timeMs: number | null }) => {
    if ((isDnf === false && timeMs !== null) || isDnf === true) return true
    return false
  },
  {
    message: 'Invalid resultDnfish',
  },
)

export const DISCIPLINES = ['3by3', '2by2'] as const
export type Discipline = (typeof DISCIPLINES)[number]
export const DEFAULT_DISCIPLINE: Discipline = '3by3'
export function isDiscipline(str: unknown): str is Discipline {
  return z.enum(DISCIPLINES).safeParse(str).success
}
export function castDiscipline(str: unknown): Discipline {
  return z.enum(DISCIPLINES).catch(DEFAULT_DISCIPLINE).parse(str)
}

export const LEADERBOARD_TYPES = ['average', 'single'] as const
export type LeaderboardType = (typeof LEADERBOARD_TYPES)[number]
export const DEFAULT_LEADERBOARD_TYPE: LeaderboardType = 'single'
export function isLeaderboardType(str: unknown): str is LeaderboardType {
  return z.enum(LEADERBOARD_TYPES).safeParse(str).success
}
export function castLeaderboardType(str: unknown): LeaderboardType {
  return z.enum(LEADERBOARD_TYPES).catch(DEFAULT_LEADERBOARD_TYPE).parse(str)
}

export type ContestResultRoundSession = {
  solves: {
    id: number
    position: ScramblePosition
    result: ResultDnfish
  }[]
  id: number
  avgMs: number | null
  nickname: string
  isOwn: boolean
}

export type SimulatorSettings = Omit<
  typeof userSimulatorSettingsTable.$inferSelect,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
>
