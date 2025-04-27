import type {
  contestTable,
  UserSchema,
  userSimulatorSettingsTable,
} from '@/backend/db/schema'
import { z } from 'zod'
import type { UserGlobalRecords } from './backend/shared/global-record'

export type SessionUser = Pick<
  UserSchema,
  'name' | 'id' | 'email' | 'finishedRegistration' | 'role'
> & { wcaId: string | null }

export type User = Pick<UserSchema, 'name' | 'id' | 'role'> & {
  wcaId: string | null
  globalRecords: UserGlobalRecords | null
}

export const SCRAMBLE_POSITIONS = ['1', '2', '3', '4', '5', 'E1', 'E2'] as const
export type ScramblePosition = (typeof SCRAMBLE_POSITIONS)[number]
export function isExtra(position: ScramblePosition) {
  return position.startsWith('E')
}
export function getExtraNumber(
  position: ScramblePosition,
): '1' | '2' | undefined {
  if (!isExtra(position)) return
  const number = position[1]
  if (number !== '1' && number !== '2')
    throw new Error(`invalid scramble position: ${position}`)
  return number
}

export const SOLVE_STATUSES = [
  'pending',
  'submitted',
  'changed_to_extra',
] as const
export type SolveStatus = (typeof SOLVE_STATUSES)[number]

export type ResultDnfable = ResultSuccess | ResultDnf
type ResultSuccess = { timeMs: number; isDnf: false; plusTwoIncluded?: boolean }
type ResultDnf = {
  timeMs: null | number
  isDnf: true
  plusTwoIncluded?: boolean
}

export const resultDnfable = z.custom<ResultDnfable>(
  ({
    isDnf,
    timeMs,
  }: {
    isDnf: boolean
    timeMs: number | null
    plusTwoIncluded?: boolean
  }) => {
    if ((isDnf === false && timeMs !== null) || isDnf === true) return true
    return false
  },
  {
    message: 'Invalid resultDnfable',
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
export function assertDiscipline(str: string): Discipline {
  return z.enum(DISCIPLINES).parse(str)
}

export const LEADERBOARD_TYPES = ['single', 'average'] as const
export type LeaderboardType = (typeof LEADERBOARD_TYPES)[number]
export const DEFAULT_LEADERBOARD_TYPE: LeaderboardType = 'single'
export function isLeaderboardType(str: unknown): str is LeaderboardType {
  return z.enum(LEADERBOARD_TYPES).safeParse(str).success
}
export function castLeaderboardType(str: unknown): LeaderboardType {
  return z.enum(LEADERBOARD_TYPES).catch(DEFAULT_LEADERBOARD_TYPE).parse(str)
}

export type ContestMetadata = Pick<
  typeof contestTable.$inferSelect,
  'startDate' | 'endDate' | 'expectedEndDate' | 'slug' | 'isOngoing'
>

export type RoundSession = {
  session: {
    result: ResultDnfable
    id: number
    isOwn: boolean
  }
  solves: {
    id: number
    position: ScramblePosition
    result: ResultDnfable
    isPersonalRecord: boolean
  }[]
  contestSlug: string
  user: User
}

export const CONTEST_UNAUTHORIZED_MESSAGE =
  'You need to be signed in to participate in an ongoing contest or view its results'

export type SimulatorSettings = Omit<
  typeof userSimulatorSettingsTable.$inferSelect,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
>

export type ContestType = (typeof CONTEST_TYPES)[number]
export const CONTEST_TYPES = ['weekly', 'special'] as const
