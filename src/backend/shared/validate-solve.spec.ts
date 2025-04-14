import { test, expect } from 'bun:test'
import { validateSolve } from './validate-solve'

test('valid solve', async () => {
  expect(
    validateSolve({ scramble: 'R U', solution: "U' R'", discipline: '3by3' }),
  )
})

test('invalid solve', async () => {
  expect(validateSolve({ scramble: 'R U', solution: 'U', discipline: '3by3' }))
})
