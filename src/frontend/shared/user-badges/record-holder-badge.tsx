import type { UserGlobalRecords } from '@/backend/shared/global-record'
import {
  HoverPopover,
  DisciplineIcon,
  AverageIcon,
  SingleIcon,
  TrophyIcon,
  SquareArrowOutUpRight,
} from '@/frontend/ui'
import { SolveTimeLabel, SolveTimeLinkOrDnf } from '../solve-time-button'
import Link from 'next/link'

export function RecordHolderBadge({
  records,
  name,
}: {
  records: UserGlobalRecords
  name: string
}) {
  return (
    <HoverPopover
      content={<RecordHolderPopover records={records} name={name} />}
      contentProps={{
        className:
          'border-2 border-b-amber-400 border-t-grey-100 border-x-grey-100',
      }}
      asChild
    >
      <span className='relative inline-flex text-amber-400'>
        <TrophyIcon className='text-sm' />
      </span>
    </HoverPopover>
  )
}

function RecordHolderPopover({
  records,
  name,
}: {
  records: UserGlobalRecords
  name: string
}) {
  const recordCount = records.averages.length + records.singles.length
  return (
    <>
      <p className='flex items-center gap-1'>
        <TrophyIcon className='-mt-1' />
        <span>
          {name} holds {recordCount} {recordCount > 1 ? 'records' : 'record'}
        </span>
      </p>
      {records.averages.map(({ contestSlug, discipline, roundSession }) => (
        <div key={roundSession.id} className='flex items-center'>
          <DisciplineIcon discipline={discipline} className='mr-3' />
          <span className='-mr-2 flex w-20 items-center gap-1 text-secondary-20'>
            <AverageIcon className='text-sm' />
            <span className='vertical-alignment-fix'>Average</span>
          </span>
          <SolveTimeLabel
            timeMs={roundSession.result.timeMs ?? undefined}
            isAverage
            className='mr-2'
          />
          <Link
            href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${roundSession.id}`}
            className='transition-base flex gap-1 whitespace-nowrap text-primary-60 hover:text-primary-80 active:text-primary-100'
          >
            Contest {contestSlug}
            <SquareArrowOutUpRight width='1em' height='1em' />
          </Link>
        </div>
      ))}

      {records.singles.map(({ contestSlug, discipline, solve }) => (
        <div key={solve.id} className='flex items-center'>
          <DisciplineIcon discipline={discipline} className='mr-3' />
          <span className='-mr-2 flex w-20 items-center gap-1 text-secondary-20'>
            <SingleIcon className='text-sm' />
            <span className='vertical-alignment-fix'>Single</span>
          </span>
          <SolveTimeLinkOrDnf
            result={solve.result}
            solveId={solve.id}
            contestSlug={contestSlug}
            discipline={discipline}
            canShowHint={false}
            className='mr-2'
          />
          <Link
            href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${solve.roundSessionId}`}
            className='transition-base flex gap-1 whitespace-nowrap text-primary-60 hover:text-primary-80 active:text-primary-100'
          >
            Contest {contestSlug}
            <SquareArrowOutUpRight width='1em' height='1em' />
          </Link>
        </div>
      ))}
    </>
  )
}
