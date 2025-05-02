import { test, expect } from 'bun:test'
import { calculateAvg } from './calculate-avg'

test('5 successes', async () => {
  const res = calculateAvg([
    { isDnf: false, timeMs: 1, plusTwoIncluded: false },
    { isDnf: false, timeMs: 2, plusTwoIncluded: false },
    { isDnf: false, timeMs: 3, plusTwoIncluded: false },
    { isDnf: false, timeMs: 4, plusTwoIncluded: false },
    { isDnf: false, timeMs: 5, plusTwoIncluded: false },
  ])
  expect(res.isDnf).toBe(false)
  expect(res.timeMs).toBe(3)
})

test('4 successes best dnf', async () => {
  const res = calculateAvg([
    { isDnf: true, timeMs: 1, plusTwoIncluded: false },
    { isDnf: false, timeMs: 2, plusTwoIncluded: false },
    { isDnf: false, timeMs: 3, plusTwoIncluded: false },
    { isDnf: false, timeMs: 4, plusTwoIncluded: false },
    { isDnf: false, timeMs: 5, plusTwoIncluded: false },
  ])
  expect(res.isDnf).toBe(false)
  expect(res.timeMs).toBe(4)
})

test('4 successes worst dnf', async () => {
  const res = calculateAvg([
    { isDnf: false, timeMs: 1, plusTwoIncluded: false },
    { isDnf: false, timeMs: 2, plusTwoIncluded: false },
    { isDnf: false, timeMs: 3, plusTwoIncluded: false },
    { isDnf: false, timeMs: 4, plusTwoIncluded: false },
    { isDnf: true, timeMs: 5, plusTwoIncluded: false },
  ])
  expect(res.isDnf).toBe(false)
  expect(res.timeMs).toBe(3)
})

test('3 successes', async () => {
  const res = calculateAvg([
    { isDnf: true, timeMs: 1, plusTwoIncluded: false },
    { isDnf: true, timeMs: 2, plusTwoIncluded: false },
    { isDnf: false, timeMs: 3, plusTwoIncluded: false },
    { isDnf: false, timeMs: 4, plusTwoIncluded: false },
    { isDnf: false, timeMs: 5, plusTwoIncluded: false },
  ])
  expect(res.isDnf).toBe(true)
  expect(res.timeMs).toBe(null)
})
