import { type ReactNode } from 'react'
import { INSPECTION_PLUS_TWO_THRESHHOLD_MS } from './constants'
import {
  MINUTE_IN_MS,
  MINUTE_IN_SECONDS,
  SECOND_IN_MS,
} from '@/lib/utils/format-solve-time'

export function getDisplay(
  solveStartTimestamp?: number,
  inspectionStartTimestamp?: number,
  currentTimestamp?: number,
): ReactNode {
  if (!currentTimestamp || !inspectionStartTimestamp) return ''
  if (solveStartTimestamp) {
    return formatElapsedTime(currentTimestamp - solveStartTimestamp)
  }

  const elapsedInspectionMs = currentTimestamp - inspectionStartTimestamp
  if (elapsedInspectionMs > INSPECTION_PLUS_TWO_THRESHHOLD_MS) return '+2'
  return (
    INSPECTION_PLUS_TWO_THRESHHOLD_MS / 1_000 -
    Math.floor(elapsedInspectionMs / 1_000)
  )
}

function formatElapsedTime(fullMs: number) {
  const fullSeconds = Math.floor(fullMs / SECOND_IN_MS)
  const minutes = Math.floor(fullMs / MINUTE_IN_MS)
  const seconds = fullSeconds - minutes * MINUTE_IN_SECONDS
  const ms = fullMs - fullSeconds * SECOND_IN_MS
  const tenths = Math.floor(ms / 100)

  if (minutes) {
    return (
      <>
        {minutes}:{seconds.toString().padStart(2, '0')}.
        <span className='text-[.75em]'>{tenths}</span>
      </>
    )
  }
  return (
    <>
      {seconds}.<span className='text-[.75em]'>{tenths}</span>
    </>
  )
}
