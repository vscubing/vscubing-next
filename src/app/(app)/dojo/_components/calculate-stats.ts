import type { ResultDnfable } from '@/types'

export type DojoSolve = {
  id: number
  result: ResultDnfable
  scramble: string
  reconstruction: string
  timestamp: number
}

// Mean of 3 - simple average of last 3 solves (DNF = DNF result)
export function calculateMo3(solves: DojoSolve[]): ResultDnfable | null {
  if (solves.length < 3) return null

  const last3 = solves.slice(0, 3)
  const dnfCount = last3.filter((s) => s.result.isDnf).length

  if (dnfCount > 0) {
    return { timeMs: null, isDnf: true, plusTwoIncluded: false }
  }

  const sum = last3.reduce((acc, s) => acc + s.result.timeMs!, 0)
  return { timeMs: Math.floor(sum / 3), isDnf: false, plusTwoIncluded: false }
}

// Average of 5 - drop best and worst, average remaining 3
export function calculateAo5(solves: DojoSolve[]): ResultDnfable | null {
  if (solves.length < 5) return null
  return calculateAvgN(solves.slice(0, 5), 3)
}

// Average of 12 - drop best and worst, average remaining 10
export function calculateAo12(solves: DojoSolve[]): ResultDnfable | null {
  if (solves.length < 12) return null
  return calculateAvgN(solves.slice(0, 12), 10)
}

// Generic average calculation: drop best and worst, average `countingResults` middle values
function calculateAvgN(
  solves: DojoSolve[],
  countingResults: number,
): ResultDnfable {
  const results = solves.map((s) => s.result)
  const dnfCount = results.filter((r) => r.isDnf).length

  // More than 1 DNF means the average is DNF
  if (dnfCount > 1) {
    return { timeMs: null, isDnf: true, plusTwoIncluded: false }
  }

  // Sort by time, DNFs go to the end
  const sorted = [...results].sort((a, b) => {
    if (a.isDnf && b.isDnf) return 0
    if (a.isDnf) return 1
    if (b.isDnf) return -1
    return a.timeMs - b.timeMs
  })

  // Remove best and worst
  const counting = sorted.slice(1, -1)

  if (counting.length < countingResults) {
    return { timeMs: null, isDnf: true, plusTwoIncluded: false }
  }

  const sum = counting.reduce((acc, r) => acc + (r.timeMs ?? 0), 0)
  return {
    timeMs: Math.floor(sum / countingResults),
    isDnf: false,
    plusTwoIncluded: false,
  }
}

// Find best mo3 from all possible windows
export function findBestMo3(solves: DojoSolve[]): ResultDnfable | null {
  if (solves.length < 3) return null

  let best: ResultDnfable | null = null

  for (let i = 0; i <= solves.length - 3; i++) {
    const window = solves.slice(i, i + 3)
    const mo3 = calculateMo3(window)
    if (mo3 && !mo3.isDnf) {
      if (!best || best.isDnf || mo3.timeMs < best.timeMs) {
        best = mo3
      }
    }
  }

  return best
}

// Find best ao5 from all possible windows
export function findBestAo5(solves: DojoSolve[]): ResultDnfable | null {
  if (solves.length < 5) return null

  let best: ResultDnfable | null = null

  for (let i = 0; i <= solves.length - 5; i++) {
    const window = solves.slice(i, i + 5)
    const ao5 = calculateAvgN(window, 3)
    if (!ao5.isDnf) {
      if (!best || best.isDnf || ao5.timeMs < best.timeMs) {
        best = ao5
      }
    }
  }

  return best
}

// Find best ao12 from all possible windows
export function findBestAo12(solves: DojoSolve[]): ResultDnfable | null {
  if (solves.length < 12) return null

  let best: ResultDnfable | null = null

  for (let i = 0; i <= solves.length - 12; i++) {
    const window = solves.slice(i, i + 12)
    const ao12 = calculateAvgN(window, 10)
    if (!ao12.isDnf) {
      if (!best || best.isDnf || ao12.timeMs < best.timeMs) {
        best = ao12
      }
    }
  }

  return best
}
