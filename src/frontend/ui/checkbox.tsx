'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '../utils/cn'

export function Checkbox({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer h-4 w-4 shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className='h-4 w-4' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export function CheckboxWithLabel({
  className,
  label,
  ...props
}: React.ComponentPropsWithRef<typeof Checkbox> & { label: React.ReactNode }) {
  return (
    <label className={cn('flex items-center gap-2', className)}>
      <Checkbox {...props} />
      <span className='vertical-alignment-fix'>{label}</span>
    </label>
  )
}
