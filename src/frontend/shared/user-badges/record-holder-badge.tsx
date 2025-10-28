import type { UserGlobalRecords } from '@/backend/shared/global-record'
import {
  HoverPopover,
  DisciplineIcon,
  AverageIcon,
  SingleIcon,
  TrophyIcon,
  SecondaryButton,
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
      asChild
      contentClassName='flex flex-col p-3 gap-4 max-w-max'
    >
      <span className='relative inline-flex text-yellow-100'>
        <TrophyIcon className='text-base' />
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
      <p className='flex items-center gap-1 self-stretch'>
        <TrophyIcon className='text-yellow-100' />
        <span className='title-h3'>
          <span className='text-white-100'>{name}</span>{' '}
          <span className='text-grey-40'>
            holds {recordCount} {recordCount > 1 ? 'records' : 'record'}
          </span>
        </span>
      </p>
      <ul className='flex flex-col gap-2'>
        {records.averages.map(({ contestSlug, discipline, roundSession }) => (
          <li
            key={roundSession.id}
            className='flex items-center rounded-lg bg-black-80 pl-2'
          >
            <span className='relative mr-2 after:absolute after:-right-1 after:top-1/2 after:h-[1.7rem] after:w-px after:-translate-y-1/2 after:bg-grey-100'>
              <DisciplineIcon discipline={discipline} className='sm:w-6' />
            </span>
            <span className='flex w-28 items-center gap-1 pl-1 sm:w-20'>
              <AverageIcon className='w-4 sm:hidden' />
              <span className='vertical-alignment-fix sm:caption whitespace-nowrap'>
                Average time
              </span>
            </span>
            <span className='relative mr-5 after:absolute after:-right-1 after:top-1/2 after:h-[1.7rem] after:w-px after:-translate-y-1/2 after:bg-grey-100'>
              <SolveTimeLabel
                timeMs={roundSession.result.timeMs ?? undefined}
                isAverage
              />
            </span>
            <SecondaryButton size='sm' asChild>
              <Link
                href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${roundSession.id}`}
                className='transition-base flex gap-1 whitespace-nowrap text-primary-60 hover:text-primary-80 active:text-primary-100'
              >
                Contest {contestSlug}
              </Link>
            </SecondaryButton>
          </li>
        ))}

        {records.singles.map(({ contestSlug, discipline, solve }) => (
          <li
            key={solve.id}
            className='flex items-center rounded-lg bg-black-80 pl-2'
          >
            <span className='relative mr-2 after:absolute after:-right-1 after:top-1/2 after:h-[1.7rem] after:w-px after:-translate-y-1/2 after:bg-grey-100'>
              <DisciplineIcon discipline={discipline} className='sm:w-6' />
            </span>
            <span className='flex w-28 items-center gap-1 pl-1 sm:w-20'>
              <SingleIcon className='w-4 sm:hidden' />
              <span className='vertical-alignment-fix sm:caption whitespace-nowrap'>
                Single time
              </span>
            </span>
            <span className='relative mr-5 after:absolute after:-right-1 after:top-1/2 after:h-[1.7rem] after:w-px after:-translate-y-1/2 after:bg-grey-100'>
              <SolveTimeLinkOrDnf
                result={solve.result}
                solveId={solve.id}
                contestSlug={contestSlug}
                discipline={discipline}
                canShowHint={false}
              />
            </span>
            <SecondaryButton size='sm' asChild>
              <Link
                href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${solve.roundSessionId}`}
                className='transition-base flex gap-1 whitespace-nowrap text-primary-60 hover:text-primary-80 active:text-primary-100'
              >
                Contest {contestSlug}
              </Link>
            </SecondaryButton>
          </li>
        ))}
      </ul>
    </>
  )
}
