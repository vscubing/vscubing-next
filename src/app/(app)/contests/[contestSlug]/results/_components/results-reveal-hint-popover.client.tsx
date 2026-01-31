'use client'

import {
  Popover,
  PopoverCloseButton,
  PopoverContent,
  ExclamationCircleIcon,
  PopoverTrigger,
} from '@/frontend/ui'
import { useLocalStorage } from '@/frontend/utils/use-local-storage'
import { useState } from 'react'

export function ResultsRevealHintPopover() {
  const [seenHint, setSeenHint] = useLocalStorage(
    'vs-seenResultsRevealHint',
    false,
  )

  const [open, setOpen] = useState(!seenHint)

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        if (!open) setSeenHint(true)
      }}
    >
      <PopoverContent
        aria-label='The results will be revealed as you go'
        className='max-w-[16rem] p-4 text-center'
      >
        <p>Other participants' results will be revealed as you go</p>
        <PopoverCloseButton
          onClick={() => {
            setSeenHint(true)
            setOpen(false)
          }}
        />
      </PopoverContent>

      <PopoverTrigger
        className='text-grey-40 transition-colors hover:text-grey-20'
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
