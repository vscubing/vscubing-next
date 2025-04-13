import { useRef, useCallback } from 'react'

// NOTE: we can't just scroll to the item at given index because it might have `position: sticky`
export function useScrollToIndex() {
  const containerRef = useRef<HTMLUListElement>(null)

  const performScrollToIndex = useCallback((idx: number) => {
    const containerElem = containerRef.current
    if (!containerElem) throw new Error('containerElem is null!')

    const children = containerElem.children
    const neighbor = children[idx + 1] ?? children[idx - 1]
    neighbor?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [])

  return { containerRef, performScrollToIdx: performScrollToIndex }
}
