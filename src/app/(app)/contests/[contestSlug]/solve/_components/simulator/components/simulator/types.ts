import type { Discipline, ResultDnfable } from '@/types'

export type InitSolveData = { scramble: string; discipline: Discipline }

export type SimulatorSolve = {
  result: ResultDnfable
  solution: string
}
export type SimulatorSolveFinishCallback = (solve: SimulatorSolve) => void
