'use client'

import { cn } from '@/app/_utils/cn'
import { Slot } from '@radix-ui/react-slot'
import React, { type ElementType } from 'react'
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
  wrapper: Wrapper = 'div',
}: ComponentPropsWithoutRef<'div'> & {
  color: string
  enabled: boolean
  wrapper?: ElementType
}) {
  const { ref, ratio } = useSpinningBorderRatio()
  return (
    <Wrapper
      style={
        {
          '--spinning-border-color': color,
          '--spinning-border-ratio': String(ratio),
        } as CSSProperties
      }
      ref={ref}
      className={cn(
        {
          "spinning-border before:animate-spinning-border relative overflow-clip before:absolute before:left-1/2 before:top-1/2 before:aspect-square before:w-[150%] before:content-['']":
            enabled,
        },
        className,
      )}
    >
      <Slot
        className={cn({
          'relative border-2 border-transparent bg-clip-padding': enabled,
        })}
      >
        {children}
      </Slot>
    </Wrapper>
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
