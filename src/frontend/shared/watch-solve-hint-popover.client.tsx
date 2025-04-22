'use client'

import type { ReactNode } from 'react'
import {
  Popover,
  PopoverAnchor,
  PopoverCloseButton,
  PopoverContent,
} from '../ui'
import { useLocalStorage } from '../utils/use-local-storage'

type WatchSolveHintPopoverProps = {
  children: ReactNode
  className?: string
  disabled: boolean
}
export function WatchSolveHintPopover({
  children,
  disabled,
}: WatchSolveHintPopoverProps) {
  const [seenHint, setSeenHint] = useLocalStorage(
    'vs-seenWatchSolveHint',
    false,
  )

  function handleClose() {
    setSeenHint(true)
  }

  return (
    <Popover open={!seenHint && !disabled}>
      <PopoverContent
        withArrow
        aria-label='Click on a time result to watch the solution'
        className='max-w-[16rem]'
      >
        <p>
          <span className='touch:hidden'>
            Click on a time result to watch the solution
          </span>
          <span className='hidden touch:inline'>
            Tap on a time result to watch the solution
          </span>
        </p>
        <PopoverCloseButton onClick={handleClose} />
      </PopoverContent>

      <PopoverAnchor asChild>{children}</PopoverAnchor>
    </Popover>
  )
}
