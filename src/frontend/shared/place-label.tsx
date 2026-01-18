import { cn } from '@/frontend/utils/cn'
import type { ComponentPropsWithRef } from 'react'
import { CrownIcon } from '../ui'

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
        'vertical-alignment-fix relative flex h-11 w-11 items-center justify-center rounded-full border border-primary-60 text-base text-white-100 sm:h-9 sm:w-9 sm:py-0 sm:text-[0.875rem]',
        {
          'border-none bg-podium-gold text-grey-100':
            podiumColors && place === 1,
          'border-none bg-podium-silver text-grey-100':
            podiumColors && place === 2,
          'border-none bg-podium-bronze text-grey-100':
            podiumColors && place === 3,
        },
        { 'border-dashed': variant === 'dashed' },
        className,
      )}
      {...props}
    >
      {podiumColors && place === 1 && (
        <CrownIcon className='absolute -right-1 -top-2 rotate-[30deg] transform text-secondary-20' />
      )}
      {place}
    </span>
  )
}
