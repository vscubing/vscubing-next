import { useRef, useState, useEffect } from 'react'

export function useFittingCount<
  TContainer extends HTMLElement = HTMLUListElement,
  TFake extends HTMLElement = HTMLLIElement,
>() {
  const containerRef = useRef<TContainer>(null)
  const fakeElementRef = useRef<TFake>(null)
  const [res, setRes] = useState<{ fittingCount: number; optimalElementHeight: number }>()

  useEffect(() => {
    if (!containerRef.current || !fakeElementRef.current) {
      return
    }

    const containerHeight = containerRef.current?.clientHeight
    const fakeElementHeight = fakeElementRef.current?.clientHeight

    const gap = parseInt(getComputedStyle(containerRef.current).gap)
    const fittingCount = Math.floor((containerHeight + gap - 1) / (fakeElementHeight + gap))

    const freeSpace = containerHeight - (fittingCount - 1) * gap
    const optimalElementHeight = Math.floor(freeSpace / fittingCount)

    setRes({ fittingCount, optimalElementHeight })
  }, [containerRef, fakeElementRef])

  return { ...res, containerRef, fakeElementRef }
}
