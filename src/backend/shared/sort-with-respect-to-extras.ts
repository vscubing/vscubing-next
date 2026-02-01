import { type ScramblePosition, isExtra } from '@/types'

export function sortWithRespectToExtras<
  T extends {
    position: ScramblePosition
  },
>(solves: T[]): T[] {
  // unknown => 1,3,4,5,E1 => 1,E1,3,4,5
  solves.sort(
    (a, b) => positionComparator(a.position) - positionComparator(b.position),
  )

  const regularSolvesPool = solves.filter(({ position }) => !isExtra(position))
  const extraSolvesPool = solves.filter(({ position }) => isExtra(position))

  const sorted: T[] = []
  while (sorted.length < solves.length) {
    if (
      regularSolvesPool[0] === undefined ||
      regularSolvesPool[0].position !== String(sorted.length + 1)
    ) {
      const extra = extraSolvesPool.shift()
      if (!extra) {
        console.error('[ERROR] NOT ENOUGH EXTRAS', JSON.stringify(solves))
        return solves
      }
      sorted.push(extra)
    } else {
      const regular = regularSolvesPool.shift()
      if (!regular) {
        console.error('[ERROR] NOT ENOUGH REGULARS', JSON.stringify(solves))
        return solves
      }
      sorted.push(regular)
    }
  }

  return sorted
}

function positionComparator(position: ScramblePosition): number {
  switch (position) {
    case '1':
      return 1
    case '2':
      return 2
    case '3':
      return 3
    case '4':
      return 4
    case '5':
      return 5
    case 'E1':
      return 6
    case 'E2':
      return 7
  }
}
