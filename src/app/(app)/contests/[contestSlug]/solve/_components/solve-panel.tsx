import { Ellipsis, CheckIcon } from '@/frontend/ui'
import { ExtraLabel } from '@/frontend/shared/extra-label'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/frontend/shared/solve-time-button'
import {
  type ScramblePosition,
  type ResultDnfable,
  type Discipline,
  getExtraNumber,
} from '@/types'
import { type ReactNode } from 'react'

export function SolvePanel({
  number,
  isPersonalRecord,
  position,
  scramble,
  solveId,
  result,
  renderAction,
  contestSlug,
  discipline,
}: {
  number: number
  isPersonalRecord: boolean
  solveId: number | null
  result: ResultDnfable | null
  position: ScramblePosition
  scramble: string
  renderAction?: ReactNode
  contestSlug: string
  discipline: Discipline
}) {
  return (
    <div className='flex h-11 items-center gap-8 rounded-xl bg-grey-100 pl-4 sm:gap-0 sm:pl-2'>
      <span className='vertical-alignment-fix relative flex h-full min-w-16 items-center justify-center after:absolute after:-right-4 after:h-6 after:w-px after:bg-grey-60 sm:min-w-4 sm:after:hidden'>
        <span className='sm:hidden'>No {number}</span>
        <span className='hidden sm:inline'>{number}.</span>
        <ExtraLabel
          extraNumber={getExtraNumber(position)}
          className='absolute right-0 top-0 sm:left-0 sm:right-auto'
        />
      </span>
      <TimeSection
        result={result}
        id={solveId}
        isPersonalRecord={isPersonalRecord}
        contestSlug={contestSlug}
        discipline={discipline}
      />
      {result ? (
        <Ellipsis className='vertical-alignment-fix flex-1'>
          {scramble}
        </Ellipsis>
      ) : (
        <>
          <span className='vertical-alignment-fix text-grey-40 md:hidden'>
            Your scramble will be displayed here after you start solving
          </span>
          <Ellipsis className='vertical-alignment-fix hidden w-0 flex-1 overflow-x-clip text-clip whitespace-nowrap text-grey-40 md:inline'>
            • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
          </Ellipsis>
        </>
      )}
      <div className='ml-auto pl-2'>
        {renderAction ?? <CheckIcon className='mr-4 text-primary-80' />}
      </div>
    </div>
  )
}

type TimeSectionProps = {
  contestSlug: string
  discipline: Discipline
  id: number | null
  result: ResultDnfable | null
  isPersonalRecord: boolean
}
function TimeSection({
  result,
  id,
  contestSlug,
  isPersonalRecord,
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
      isFestive={isPersonalRecord}
      result={result}
      discipline={discipline}
      backgroundColorClass='bg-grey-100'
    />
  )
}
