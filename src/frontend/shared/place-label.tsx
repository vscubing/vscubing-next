import { cn } from '@/frontend/utils/cn'
import type { ComponentPropsWithRef } from 'react'

export function PlaceLabel({
  children: place,
  podiumColors = false,
  variant,
  className,
  onClick,
  ...props
}: ComponentPropsWithRef<'span'> & {
  podiumColors?: boolean
  variant?: 'default' | 'dashed'
  children: number
}) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'vertical-alignment-fix flex h-11 w-11 items-center justify-center rounded-full border border-primary-60 text-[1rem] text-white-100 sm:h-9 sm:w-9 sm:py-0 sm:text-[0.875rem]',
        {
          'border-2 border-[#e0c84a]': podiumColors && place === 1,
          'border-2 border-[#9daebf]': podiumColors && place === 2,
          'border-2 border-[#d27c45]': podiumColors && place === 3,
        },
        { 'border-dashed': variant === 'dashed' },
        className,
      )}
      {...props}
    >
      {place}
    </span>
  )
}
