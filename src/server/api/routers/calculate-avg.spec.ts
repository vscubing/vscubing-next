import { test, expect } from 'bun:test'
import { calculateAvg } from './calculate-avg'

test('5 successes', async () => {
  const res = calculateAvg([
    { isDnf: false, timeMs: 1 },
    { isDnf: false, timeMs: 2 },
    { isDnf: false, timeMs: 3 },
    { isDnf: false, timeMs: 4 },
    { isDnf: false, timeMs: 5 },
  ])
  expect(res.isDnf === false)
  expect(res.timeMs === 3)
})

test('4 successes best dnf', async () => {
  const res = calculateAvg([
    { isDnf: true, timeMs: 1 },
    { isDnf: false, timeMs: 2 },
    { isDnf: false, timeMs: 3 },
    { isDnf: false, timeMs: 4 },
    { isDnf: false, timeMs: 5 },
  ])
  expect(res.isDnf === false)
  expect(res.timeMs === 4)
})

test('4 successes worst dnf', async () => {
  const res = calculateAvg([
    { isDnf: false, timeMs: 1 },
    { isDnf: false, timeMs: 2 },
    { isDnf: false, timeMs: 3 },
    { isDnf: false, timeMs: 4 },
    { isDnf: true, timeMs: 5 },
  ])
  expect(res.isDnf === false)
  expect(res.timeMs === 3)
})

test('3 successes', async () => {
  const res = calculateAvg([
    { isDnf: true, timeMs: 1 },
    { isDnf: true, timeMs: 2 },
    { isDnf: false, timeMs: 3 },
    { isDnf: false, timeMs: 4 },
    { isDnf: false, timeMs: 5 },
  ])
  expect(res.isDnf === true)
  expect(res.timeMs === null)
})
