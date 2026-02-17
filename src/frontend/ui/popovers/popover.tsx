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
  hideArrow = false,
  ...props
}: ComponentPropsWithRef<typeof PopoverPrimitive.Content> & {
  hideArrow?: boolean
}) {
  return (
    <PopoverPrimitive.Content
      onOpenAutoFocus={(event) => event.preventDefault()}
      collisionPadding={12}
      className={cn(
        'relative z-20 max-w-[calc(100vw-12px*2)] whitespace-normal rounded-xl border border-grey-60 bg-black-100 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        {
          'data-[side=top]:after:absolute data-[side=top]:after:left-0 data-[side=top]:after:top-full data-[side=top]:after:h-5 data-[side=top]:after:w-full':
            !hideArrow,
          'data-[side=bottom]:after:absolute data-[side=bottom]:after:bottom-full data-[side=bottom]:after:left-0 data-[side=bottom]:after:h-5 data-[side=bottom]:after:w-full':
            !hideArrow,
          'data-[side=left]:after:absolute data-[side=left]:after:left-full data-[side=left]:after:top-0 data-[side=left]:after:h-full data-[side=left]:after:w-5':
            !hideArrow,
          'data-[side=right]:after:absolute data-[side=right]:after:right-full data-[side=right]:after:top-0 data-[side=right]:after:h-full data-[side=right]:after:w-5':
            !hideArrow,
        },
        className,
      )}
      ref={ref}
      side={side}
      {...props}
    >
      <div>{children}</div>
      {!hideArrow && (
        <PopoverPrimitive.Arrow asChild>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='21'
            height='16'
            viewBox='0 0 21 16'
            fill='none'
          >
            <mask
              id='mask0_4054_61791'
              style={{ maskType: 'alpha' }}
              maskUnits='userSpaceOnUse'
              x='0'
              y='0'
              width='21'
              height='16'
            >
              <rect width='21' height='16' fill='#D9D9D9' />
            </mask>
            <g mask='url(#mask0_4054_61791)'>
              <path
                d='M11.8291 14.3809C11.2678 15.4537 9.73221 15.4537 9.1709 14.3809L-0.0830078 -3.30469C-0.605363 -4.30331 0.119106 -5.49985 1.24609 -5.5L19.7539 -5.5C20.8809 -5.49985 21.6054 -4.30331 21.083 -3.30469L11.8291 14.3809Z'
                fill='#1B1E25'
                stroke='#6B7980'
              />
            </g>
          </svg>
        </PopoverPrimitive.Arrow>
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
  contentClassName,
  side,
  hideArrow,
}: {
  children: ReactNode
  asChild?: boolean
  content: ReactNode
  contentClassName?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  hideArrow?: boolean
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
          side={side}
          hideArrow={hideArrow}
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
