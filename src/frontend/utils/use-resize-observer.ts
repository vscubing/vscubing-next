import { useEffect } from 'react'

export function useResizeObserver({
  ref,
  onResize,
}: {
  ref: { current: HTMLElement | null }
  onResize: () => void
}) {
  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new ResizeObserver(() => onResize())

    observer.observe(node)

    return () => observer.disconnect()
  }, [ref, onResize])
}
