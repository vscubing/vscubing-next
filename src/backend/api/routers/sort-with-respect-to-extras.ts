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
  let i = 0
  while (i < solves.length) {
    const regular = regularSolvesPool.shift()

    if (!regular || regular.position !== String(i + 1)) {
      const extra = extraSolvesPool.shift()
      if (!extra) throw new Error('not enough extras')
      sorted.push(extra)
      i++
    }

    if (regular) {
      sorted.push(regular)
      i++
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
