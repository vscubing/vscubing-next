import { test, expect } from 'bun:test'
import { validateSolve } from './validate-solve'

test('valid 3x3x3 solve', async () => {
  const { isValid, error } = await validateSolve({
    scramble: 'R U',
    solution: "U' R'",
    discipline: '3by3',
  })
  expect(isValid).toBe(true)
  expect(error).toBe(null)
})

test('valid 4x4x4 solve', async () => {
  const { isValid, error } = await validateSolve({
    scramble: "R U Rw'",
    solution: "Rw U' R'",
    discipline: '4by4',
  })
  expect(isValid).toBe(true)
  expect(error).toBe(null)
})

test('invalid 4x4x4 solve', async () => {
  const { isValid, error } = await validateSolve({
    scramble: 'R U Rw',
    solution: 'U',
    discipline: '3by3',
  })
  expect(isValid).toBe(false)
  expect(error).toBe(null)
})

test('incorrect syntax', async () => {
  {
    const { isValid, error } = await validateSolve({
      scramble: 'R U',
      solution: 'U*rdd',
      discipline: '3by3',
    })
    expect(isValid).toBe(false)
    expect(error).not.toBe(null)
  }
})
