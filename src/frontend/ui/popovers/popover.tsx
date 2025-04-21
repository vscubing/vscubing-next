'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/frontend/utils/cn'
import { useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { UnderlineButton } from '../buttons'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

function PopoverContent({
  className,
  children,
  ref,
  withArrow,
  side = 'top',
  ...props
}: ComponentPropsWithRef<typeof PopoverPrimitive.Content> & {
  withArrow?: boolean
}) {
  return (
    <PopoverPrimitive.Content
      onOpenAutoFocus={(event) => event.preventDefault()}
      collisionPadding={20}
      className={cn(
        'relative z-20 flex flex-col items-center gap-2 whitespace-normal rounded-xl bg-black-100 p-4 text-center animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        {
          'mb-2 after:absolute after:-bottom-2 after:h-2 after:w-full':
            !withArrow,
        },
        className,
      )}
      ref={ref}
      side={side}
      {...props}
    >
      {children}
      {withArrow && (
        <PopoverPrimitive.Arrow
          width={22}
          className='fill-black-100'
          height={18}
        ></PopoverPrimitive.Arrow>
      )}
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
  contentProps,
}: {
  children: ReactNode
  asChild?: boolean
  content: ReactNode
  contentProps?: ComponentPropsWithRef<typeof PopoverContent>
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
      <PopoverPrimitive.PopoverPortal>
        <PopoverContent
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...contentProps}
        >
          {content}
        </PopoverContent>
      </PopoverPrimitive.PopoverPortal>
    </Popover>
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverCloseButton,
  PopoverContent,
}
