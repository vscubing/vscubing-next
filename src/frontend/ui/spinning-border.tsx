'use client'

import { cn } from '@/frontend/utils/cn'
import { Slot } from '@radix-ui/react-slot'
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useRef,
  useEffect,
} from 'react'
import { useDebounceValue } from 'usehooks-ts'

export function SpinningBorder({
  color,
  children,
  className,
  enabled,
}: ComponentPropsWithoutRef<'div'> & {
  color: string
  enabled: boolean
}) {
  const { ref, ratio } = useSpinningBorderRatio()

  if (!enabled)
    return <Slot className='border-2 border-transparent'>{children}</Slot>
  return (
    <div
      style={
        {
          '--spinning-border-color': color,
          '--spinning-border-ratio': String(ratio),
        } as CSSProperties
      }
      ref={ref}
      className={cn(
        "spinning-border relative overflow-clip before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[150%] before:animate-spinning-border before:content-['']",
        className,
      )}
    >
      <Slot className='relative border-2 border-transparent bg-clip-padding'>
        {children}
      </Slot>
    </div>
  )
}

function useSpinningBorderRatio() {
  const ref = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useDebounceValue<number | undefined>(undefined, 200)
  useEffect(() => {
    const node = ref.current
    if (!node) return

    const resizeObserver = new ResizeObserver(() => {
      setRatio(node.offsetHeight / node.offsetWidth)
    })

    resizeObserver.observe(node)
    return () => resizeObserver.unobserve(node)
  })
  return { ref, ratio }
}
