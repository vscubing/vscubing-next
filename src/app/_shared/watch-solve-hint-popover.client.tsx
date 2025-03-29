'use client'

import type { ReactNode } from 'react'
import {
  Popover,
  PopoverAnchor,
  PopoverCloseButton,
  PopoverContent,
} from '../_components/ui'
import { useIsTouchDevice } from '../_utils/useMediaQuery'
import { useLocalStorage } from '../_utils/use-local-storage'

type WatchSolveHintPopoverProps = {
  children: ReactNode
  className?: string
  disabled: boolean
}
export function WatchSolveHintPopover({
  children,
  disabled,
}: WatchSolveHintPopoverProps) {
  const isTouchDevice = useIsTouchDevice()
  const [seenHint, setSeenHint] = useLocalStorage(
    'vs-seenWatchSolveHint',
    false,
  )

  function handleClose() {
    setSeenHint(true)
  }

  return (
    <Popover open={!seenHint && !disabled}>
      <PopoverContent>
        <p>
          {isTouchDevice
            ? 'Tap on a time result to watch the solution'
            : 'Click on a time result to watch the solution'}
        </p>
        <PopoverCloseButton onClick={handleClose} />
      </PopoverContent>

      <PopoverAnchor asChild>{children}</PopoverAnchor>
    </Popover>
  )
}
