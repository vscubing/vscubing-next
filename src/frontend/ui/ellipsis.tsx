'use client'

import { cn } from '@/frontend/utils/cn'
import {
  type HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

type EllipsisProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: string
}

const Ellipsis = ({
  ref,
  children: text,
  className,
  ...props
}: EllipsisProps & {
  ref?: React.RefObject<HTMLSpanElement>
}) => {
  const innerRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const abortSignal = new AbortController()

    window.addEventListener(
      'resize',
      () => {
        const elem = innerRef.current
        if (elem?.textContent && elem.offsetWidth < elem.scrollWidth)
          elem.setAttribute('title', elem.textContent)
        else elem?.removeAttribute('title')
      },
      { signal: abortSignal.signal },
    )

    return () => abortSignal.abort()
  }, [text, innerRef])
  useImperativeHandle(ref, () => innerRef.current!, [innerRef])
  return (
    <span
      className={cn(
        'w-0 overflow-x-clip text-ellipsis whitespace-nowrap',
        className,
      )}
      ref={innerRef}
      {...props}
    >
      {text}
    </span>
  )
}

export { Ellipsis }
