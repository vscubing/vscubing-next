import { cn } from '@/frontend/utils/cn'
import type { ComponentPropsWithRef } from 'react'

export function PlaceLabel({
  children: place,
  className,
  ...props
}: ComponentPropsWithRef<'span'> & { children: number }) {
  return (
    <span
      className={cn(
        'vertical-alignment-fix text-large flex h-11 w-11 items-center justify-center rounded-full border border-primary-60 sm:h-9 sm:w-9 sm:py-0',
        {
          'transition-base outline-ring hover:border-primary-80 active:border-primary-80 active:text-primary-80':
            false,
        },
        className,
      )}
      {...props}
    >
      {place}
    </span>
  )
}
