import { useState, useCallback, useEffect } from 'react'
import type { Discipline } from '@/types'

const DISCIPLINE_EVENT_MAP: Record<Discipline, string> = {
  '3by3': '333',
  '2by2': '222',
  '4by4': '444',
}

export function useScramble(discipline: Discipline) {
  const [scramble, setScramble] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const generateNewScramble = useCallback(async () => {
    setIsLoading(true)
    try {
      const { randomScrambleForEvent } =
        await import('@vscubing/cubing/scramble')
      const eventId = DISCIPLINE_EVENT_MAP[discipline]
      const alg = await randomScrambleForEvent(eventId)
      setScramble(alg.toString())
    } catch (error) {
      console.error('Failed to generate scramble:', error)
      setScramble(generateFallbackScramble(discipline))
    } finally {
      setIsLoading(false)
    }
  }, [discipline])

  useEffect(() => {
    void generateNewScramble()
  }, [generateNewScramble])

  return { scramble, isLoading, generateNewScramble }
}

function generateFallbackScramble(discipline: Discipline): string {
  const moves =
    discipline === '2by2' ? ['R', 'U', 'F'] : ['R', 'U', 'F', 'B', 'L', 'D']
  const modifiers = ['', "'", '2']
  const length = 3

  const scrambleMoves: string[] = []
  let lastMove = ''

  for (let i = 0; i < length; i++) {
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
