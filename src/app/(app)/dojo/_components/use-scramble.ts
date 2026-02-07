import { useState, useCallback, useEffect, useRef } from 'react'
import type { Discipline } from '@/types'

export function useScramble(discipline: Discipline) {
  const [scramble, setScramble] = useState<string | null>(null)
  const nextScrambleRef = useRef<Promise<string> | null>(null)

  const preGenerateNext = useCallback(() => {
    nextScrambleRef.current = generateScramble(discipline)
  }, [discipline])

  const generateNewScramble = useCallback(async () => {
    if (nextScrambleRef.current) {
      const nextScramble = await nextScrambleRef.current
      setScramble(nextScramble)
      preGenerateNext()
    } else {
      const scrambleStr = await generateScramble(discipline)
      setScramble(scrambleStr)
      preGenerateNext()
    }
  }, [discipline, preGenerateNext])

  useEffect(() => {
    void generateNewScramble()
  }, [generateNewScramble])

  return { scramble, generateNewScramble }
}

async function generateScramble(discipline: Discipline): Promise<string> {
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
