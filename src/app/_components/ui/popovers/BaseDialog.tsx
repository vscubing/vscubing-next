'use client'

import {
  type ElementRef,
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react'
import { PrimaryButton, SecondaryButton } from '../buttons'
import { tw, useMatchesScreen } from '@/app/_utils/tailwind'
import { cn } from '@/app/_utils/cn'

export const baseDialogOverlay = tw(
  'fixed inset-0 z-50 bg-black-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
)
export const baseDialogOverlayInner = tw(
  'fixed inset-0 bg-cubes bg-cover bg-bottom opacity-40',
)

export const baseDialogContent = tw(
  'bg-card-gradient fixed left-[50%] top-[50%] z-50 flex max-w-[40rem] translate-x-[-50%] translate-y-[-50%] flex-col items-center gap-8 rounded-2xl px-24 py-10 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:w-[28rem] sm:min-w-0 sm:max-w-[calc(100%-2rem)] sm:gap-6 sm:px-4 sm:py-10',
)
export const baseDialogTitle = tw('title-h2 text-center')

type BaseDialogButtonProps = ComponentPropsWithoutRef<'button'> & {
  size?: 'sm' | 'lg'
  version: 'secondary' | 'primary'
}

export const BaseDialogButton = forwardRef<
  ElementRef<'button'>,
  BaseDialogButtonProps
>(({ className, size, version, children, ...props }, ref) => {
  const isSmScreen = useMatchesScreen('sm')
  if (!size) size = isSmScreen ? 'sm' : 'lg'

  if (version === 'primary')
    return (
      <PrimaryButton
        size={size}
        className={cn(
          'h-15 min-w-28 whitespace-nowrap sm:h-11 sm:min-w-20',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </PrimaryButton>
    )

  if (version === 'secondary')
    return (
      <SecondaryButton
        size={size}
        className={cn(
          'sm:btn-sm h-15 min-w-28 whitespace-nowrap text-xl leading-[inherit] sm:h-11 sm:min-w-20',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </SecondaryButton>
    )
})
BaseDialogButton.displayName = 'Dialog button'

export const baseDialogFooter = tw('flex w-full justify-center gap-4')
