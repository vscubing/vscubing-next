import type { ResultDnfish } from '@/app/_types'

const COUNTING_RESULTS = 3

export function calculateAvg(results: ResultDnfish[]): ResultDnfish {
  const counting = results
    .filter(({ isDnf }) => !isDnf)
    .map(({ timeMs }) => timeMs!)
    .sort()
  counting.sort((a, b) => a - b)

  counting.shift()
  if (counting.length > COUNTING_RESULTS) counting.pop()
  if (counting.length < COUNTING_RESULTS) return { timeMs: null, isDnf: true }

  return {
    timeMs: Math.floor(counting.reduce((a, b) => a + b, 0) / COUNTING_RESULTS),
    isDnf: false,
  }
}
