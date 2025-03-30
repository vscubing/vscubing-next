import { test, expect } from 'bun:test'
import { generateScrambles } from './generate-scrambles'
import { Alg } from '@vscubing/cubing/alg'

test('generates 3x3 scrambles correctly', async () => {
  const res = await generateScrambles('3by3', 7)
  expect(res.length === 7)

  res.forEach((scramble) => {
    const algNodes = Array.from(new Alg(scramble).childAlgNodes())
    expect(algNodes.length > 10)
  })
})

test('generates 2x2 scrambles correctly', async () => {
  const res = await generateScrambles('2by2', 7)
  expect(res.length === 7)

  res.forEach((scramble) => {
    const algNodes = Array.from(new Alg(scramble).childAlgNodes())
    expect(algNodes.length > 5)
  })
})
