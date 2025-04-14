import { getScrollContainer } from '@/app/(app)/layout'
import { useRef, useCallback } from 'react'

export function useScrollToIndex() {
  const containerRef = useRef<HTMLUListElement>(null)

  const performScrollToIndex = useCallback((idx: number) => {
    const listContainer = containerRef.current
    if (!listContainer) throw new Error('containerElem is null!')

    const children = listContainer.children
    const item = children[idx - 1]
    if (!item) return
    const scrollContainer = getScrollContainer()
    scrollContainer.scroll({
      top:
        item.getBoundingClientRect().top +
        item.clientHeight -
        scrollContainer.clientHeight / 2,
      behavior: 'smooth',
    })
  }, [])

  return { containerRef, performScrollToIdx: performScrollToIndex }
}
