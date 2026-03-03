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
        'vertical-alignment-fix border-primary-60 text-white-100 relative flex h-11 w-11 items-center justify-center rounded-full border text-base sm:h-9 sm:w-9 sm:py-0 sm:text-[0.875rem]',
        {
          'bg-podium-gold text-grey-100 border-none':
            podiumColors && place === 1 && variant !== 'dashed',
          'bg-podium-silver text-grey-100 border-none':
            podiumColors && place === 2 && variant !== 'dashed',
          'bg-podium-bronze text-grey-100 border-none':
            podiumColors && place === 3 && variant !== 'dashed',
          'border-podium-gold border-dashed':
            podiumColors && place === 1 && variant === 'dashed',
          'border-podium-silver border-dashed':
            podiumColors && place === 2 && variant === 'dashed',
          'border-podium-bronze border-dashed':
            podiumColors && place === 3 && variant === 'dashed',
        },
        { 'border-dashed': variant === 'dashed' && !podiumColors },
        className,
      )}
      {...props}
    >
      {podiumColors && place === 1 && variant !== 'dashed' && (
        <CrownIcon className='text-secondary-20 absolute -top-2 -right-1 rotate-[30deg] transform' />
      )}
      {place}
    </span>
  )
}
