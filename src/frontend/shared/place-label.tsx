import { cn } from '@/frontend/utils/cn'
import type { ComponentPropsWithRef } from 'react'

export function PlaceLabel({
  children: place,
  podiumColors,
  className,
  onClick,
  ...props
}: ComponentPropsWithRef<'span'> & {
  podiumColors?: boolean
  children: number
}) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full sm:h-9 sm:w-9 sm:py-0',
        'vertical-alignment-fix text-large border border-primary-60',
        {
          'text-large text-white-100': !podiumColors || place > 3,
          'border-2 border-[#e0c84a]': podiumColors && place === 1,
          'border-2 border-[#9daebf]': podiumColors && place === 2,
          'border-2 border-[#d27c45]': podiumColors && place === 3,
        },
        className,
      )}
      {...props}
    >
      {place}
    </span>
  )
}
