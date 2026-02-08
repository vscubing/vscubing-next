import { useState, useEffect } from 'react'
import type { Discipline } from '@/types'

export function useScramble(discipline: Discipline, easyMode: boolean) {
  const [scramble, setScramble] = useState<string | null>(null)
  const [nextScramble, setNextScramble] = useState<string | null>(null)

  async function moveToNextScramble() {
    setScramble(nextScramble)
    setNextScramble(await generateScramble(discipline, easyMode))
  }

  useEffect(() => {
    void fn()
    async function fn() {
      setScramble(await generateScramble(discipline, easyMode))
      setNextScramble(await generateScramble(discipline, easyMode))
    }
  }, [discipline, easyMode])

  return { scramble, nextScramble, moveToNextScramble }
}

async function generateScramble(
  discipline: Discipline,
  easyMode: boolean,
): Promise<string> {
  if (easyMode) {
    return generateEasyScramble()
  }

  switch (discipline) {
    case '3by3': {
      const { scramble_333 } = await import('vendor/cstimer/scramble/3x3x3')
      return scramble_333.getRandomScramble()
    }
    case '2by2': {
      const { scramble_222 } = await import('vendor/cstimer/scramble/2x2x2')
      return scramble_222.getRandomScramble()
    }
    case '4by4': {
      const { scramble_444 } = await import('vendor/cstimer/scramble/4x4x4')
      return scramble_444.getRandomScramble()
    }
  }
}

function generateEasyScramble(): string {
  const moves = ['R', 'U', 'F', 'B', 'L', 'D']
  const modifiers = ['', "'", '2']
  const scrambleMoves: string[] = []
  let lastMove = ''

  for (let i = 0; i < 2; i++) {
    let move: string
    do {
      move = moves[Math.floor(Math.random() * moves.length)]!
    } while (move === lastMove)
    lastMove = move
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    scrambleMoves.push(move + modifier)
  }

  return scrambleMoves.join(' ')
}
