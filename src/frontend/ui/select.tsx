'use client'

import { cn } from '@/frontend/utils/cn'
import {
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDownIcon } from './icons'

export function Select<T extends string>({
  options,
  value,
  onValueChange,
  className,
}: {
  options: Readonly<{ value: T; view?: ReactNode }[]>
  value: T
  onValueChange: (value: T) => void
  className?: string
}) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(val) => onValueChange(val as T)}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'group bg-black-100 flex h-12 min-w-[5.625rem] items-center justify-between gap-2 rounded-lg px-4',
          className,
        )}
      >
        <span className='text-base'>
          <SelectPrimitive.Value />
        </span>
        <SelectPrimitive.Icon>
          <ChevronDownIcon className='h-4 w-4 group-data-[state=open]:rotate-180' />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content
        className='scrollbar bg-black-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 mt-1 max-h-80 overflow-x-auto rounded-lg'
        align='end'
        position='popper'
        style={{ minWidth: 'var(--radix-select-trigger-width)' }}
      >
        {options.map(({ value, view }) => (
          <SelectItem key={value} value={value}>
            {view ?? value}
          </SelectItem>
        ))}
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  )
}

export function SelectItem({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  ref?: React.RefObject<ComponentRef<typeof SelectPrimitive.Item>>
}) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'hover:bg-primary-100 active:bg-primary-100 data-[state=checked]:bg-primary-100 flex w-full min-w-[5.625rem] cursor-pointer items-center rounded-lg px-4 py-[0.625rem] text-base outline-none',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
