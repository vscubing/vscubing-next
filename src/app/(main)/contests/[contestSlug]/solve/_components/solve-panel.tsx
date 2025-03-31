import { Ellipsis, CheckIcon } from '@/app/_components/ui'
import { ExtraLabel } from '@/app/_shared/ExtraLabel'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/app/_shared/SolveTimeButton'
import type { ScramblePosition } from '@/app/_types'
import { type ReactNode } from 'react'

export function SolvePanel({
  number,
  timeMs,
  isDnf,
  scramble: { moves, position },
  id,
  isInited = true,
  ActionComponent,
  contestSlug,
}: {
  number: number
  timeMs?: number
  isDnf?: boolean
  scramble: { moves: string; position: ScramblePosition }
  id?: number
  isInited?: boolean
  ActionComponent?: ReactNode
  contestSlug: string
}) {
  return (
    <div className='flex h-11 items-center gap-8 rounded-xl bg-grey-100 pl-4'>
      <span className='vertical-alignment-fix relative flex h-full min-w-16 items-center justify-center after:absolute after:-right-4 after:h-6 after:w-px after:bg-grey-60'>
        No {number}
        <ExtraLabel
          scramblePosition={position}
          className='absolute right-0 top-0'
        />
      </span>
      <TimeSection
        timeMs={timeMs}
        isDnf={isDnf}
        id={id}
        isInited={isInited}
        contestSlug={contestSlug}
      />
      {isInited ? (
        <Ellipsis className='vertical-alignment-fix flex-1'>{moves}</Ellipsis>
      ) : (
        <span className='vertical-alignment-fix text-grey-40'>
          Your scramble will be displayed here after you start solving
        </span>
      )}
      <div className='ml-auto'>
        {ActionComponent ?? <CheckIcon className='mr-4 text-primary-80' />}
      </div>
    </div>
  )
}

type TimeSectionProps = {
  timeMs?: number
  isDnf?: boolean
  id?: number
  isInited: boolean
  contestSlug: string
}
function TimeSection({
  timeMs,
  isDnf,
  id,
  isInited,
  contestSlug,
}: TimeSectionProps) {
  if (!isInited) {
    return <SolveTimeLabel isPlaceholder />
  }
  if (isDnf) {
    return <SolveTimeLabel isDnf />
  }
  if (id === undefined) {
    throw Error('solve id is undefined')
  }
  if (timeMs === undefined) {
    throw Error('solve time is undefined')
  }
  return (
    <SolveTimeLinkOrDnf
      canShowHint={false}
      contestSlug={contestSlug}
      solveId={id}
      timeMs={timeMs}
      isDnf={false}
    />
  )
}
