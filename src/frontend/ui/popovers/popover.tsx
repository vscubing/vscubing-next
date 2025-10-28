'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/frontend/utils/cn'
import { useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { UnderlineButton } from '../buttons'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor
const PopoverPortal = PopoverPrimitive.Portal

function PopoverContent({
  className,
  children,
  ref,
  side = 'top',
  ...props
}: ComponentPropsWithRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Content
      onOpenAutoFocus={(event) => event.preventDefault()}
      collisionPadding={12}
      className={cn(
        'relative z-20 max-w-[calc(100vw-12px*2)] whitespace-normal rounded-xl border border-grey-60 bg-black-100 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        'mb-2 after:absolute after:-bottom-3 after:h-3 after:w-full', // arrow
        className,
      )}
      ref={ref}
      side={side}
      {...props}
    >
      {children}
      <PopoverPrimitive.Arrow
        width={22}
        className='-my-px border-none fill-black-100 drop-shadow-[0_2px_0_#6B7980]'
        height={18}
      ></PopoverPrimitive.Arrow>
    </PopoverPrimitive.Content>
  )
}

type PopoverCloseButtonProps = Parameters<typeof UnderlineButton>[0]
function PopoverCloseButton({
  children = 'Got it',
  size = 'sm',
  ...props
}: PopoverCloseButtonProps) {
  return (
    <PopoverPrimitive.Close asChild>
      <UnderlineButton size={size} {...props}>
        {children}
      </UnderlineButton>
    </PopoverPrimitive.Close>
  )
}

export function HoverPopover({
  children: trigger,
  asChild,
  content,
  contentClassName,
}: {
  children: ReactNode
  asChild?: boolean
  content: ReactNode
  contentClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const handleMouseEnter = () => {
    setOpen(true)
  }
  const handleMouseLeave = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='outline-none'
        asChild={asChild}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={contentClassName}
        >
          {content}
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverCloseButton,
  PopoverContent,
  PopoverPortal,
}
