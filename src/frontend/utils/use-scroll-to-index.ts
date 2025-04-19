import { getScrollContainer } from '@/app/(app)/layout'
import { useRef, useCallback } from 'react'

export function useScrollToIndex() {
  const containerRef = useRef<HTMLUListElement>(null)

  const performScrollToIndex = useCallback((idx: number) => {
    const listContainer = containerRef.current
    if (!listContainer) throw new Error('containerElem is null!')

    const children = listContainer.children
    const prevItem = children[idx - 1]

    const scrollContainer = getScrollContainer()

    const top = prevItem
      ? prevItem.getBoundingClientRect().top +
        prevItem.clientHeight -
        scrollContainer.clientHeight / 2
      : 0

    scrollContainer.scroll({
      top,
      behavior: 'smooth',
    })
  }, [])

  return { containerRef, performScrollToIdx: performScrollToIndex }
}
