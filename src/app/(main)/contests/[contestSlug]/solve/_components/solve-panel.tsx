import { Ellipsis, CheckIcon } from '@/app/_components/ui'
import { ExtraLabel } from '@/app/_shared/ExtraLabel'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/app/_shared/SolveTimeButton'
import type { ScramblePosition, ResultDnfish, Discipline } from '@/app/_types'
import { type ReactNode } from 'react'

export function SolvePanel({
  number,
  position,
  scramble,
  solveId,
  result,
  ActionComponent,
  contestSlug,
  discipline,
}: {
  number: number
  solveId: number | null
  result: ResultDnfish | null
  position: ScramblePosition
  scramble: string
  ActionComponent?: ReactNode
  contestSlug: string
  discipline: Discipline
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
        result={result}
        id={solveId}
        contestSlug={contestSlug}
        discipline={discipline}
      />
      {!!result ? (
        <Ellipsis className='vertical-alignment-fix flex-1'>
          {scramble}
        </Ellipsis>
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
  contestSlug: string
  discipline: Discipline
  id: number | null
  result: ResultDnfish | null
}
function TimeSection({
  result,
  id,
  contestSlug,
  discipline,
}: TimeSectionProps) {
  if (!result || !id) {
    return <SolveTimeLabel isPlaceholder />
  }
  if (result.isDnf) {
    return <SolveTimeLabel isDnf />
  }
  return (
    <SolveTimeLinkOrDnf
      canShowHint={false}
      contestSlug={contestSlug}
      solveId={id}
      result={result}
      discipline={discipline}
    />
  )
}
