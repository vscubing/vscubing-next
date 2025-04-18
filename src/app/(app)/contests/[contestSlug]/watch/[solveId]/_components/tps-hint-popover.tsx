'use client'

import { Popover, PopoverTrigger, PopoverContent } from '@/frontend/ui'
import { PopoverPortal } from '@radix-ui/react-popover'
import { useState, type ReactNode } from 'react'

export function TpsHintPopover({ children }: { children: ReactNode }) {
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
      >
        {children}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Turns per second
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
