'use client'

import {
  Popover,
  PopoverCloseButton,
  PopoverContent,
  ExclamationCircleIcon,
  PopoverTrigger,
  PopoverPortal,
} from '@/frontend/ui'
import { cn } from '@/frontend/utils/cn'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export function ResultsRevealHintPopover({
  className,
}: {
  className?: string
}) {
  const [seenHint, setSeenHint] = useLocalStorage(
    'vs-seenResultsRevealHint',
    false,
  )

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!seenHint) {
      setOpen(true)
    }
  }, [seenHint])

  return (
    <Popover open={open}>
      <PopoverPortal>
        <PopoverContent className='max-w-[16rem] p-4 text-center'>
          <p>
            Other participants' results are revealed as you complete each
            attempt. If this is distracting, switch to Classic solve view.
          </p>
          <PopoverCloseButton
            onClick={() => {
              setSeenHint(true)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </PopoverPortal>

      <PopoverTrigger
        className={cn(
          'text-white-100 transition-colors hover:text-grey-20',
          className,
        )}
        aria-label='Information about results reveal'
        onClick={() => {
          setSeenHint(true)
          setOpen((prev) => !prev)
        }}
      >
        <ExclamationCircleIcon className='h-6 w-6' />
      </PopoverTrigger>
    </Popover>
  )
}
