'use client'

import { cn } from '@/frontend/utils/cn'
import { Slot } from '@radix-ui/react-slot'
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useRef,
  useState,
  useEffect,
} from 'react'

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

  if (!enabled) return children
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
        "spinning-border relative mx-[-2px] overflow-clip before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[150%] before:animate-spinning-border before:content-['']",
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
  const [ratio, setRatio] = useState<number | undefined>()
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
