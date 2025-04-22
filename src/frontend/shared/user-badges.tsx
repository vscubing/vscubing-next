'use client'

import Link from 'next/link'
import {
  AverageIcon,
  CodeXmlIcon,
  DisciplineIcon,
  HoverPopover,
  SingleIcon,
  SquareArrowOutUpRight,
  TrophyIcon,
  MedalIcon,
  WcaLogoIcon,
} from '../ui'
import type { UserGlobalRecords } from '@/backend/shared/record-subquery'
import { SolveTimeLabel, SolveTimeLinkOrDnf } from './solve-time-button'
import type { User } from '@/types'

export function UserBadges({ user }: { user: User }) {
  return (
    <span className='flex items-center gap-2'>
      {user.role === 'admin' && <DeveloperBadge />}
      {user.globalRecords && (
        <RecordHolderBadge records={user.globalRecords} name={user.name} />
      )}
      {user.wcaId && <WcaBadgeLink wcaId={user.wcaId} />}
    </span>
  )
}

function WcaBadgeLink({ wcaId }: { wcaId: string }) {
  return (
    <Link href={`https://worldcubeassociation.org/persons/${wcaId}`}>
      <WcaLogoIcon className='text-xs' />
    </Link>
  )
}

function RecordHolderBadge({
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
      <span className='relative -mt-1 inline-flex text-amber-400'>
        <TrophyIcon className='text-large' />
        <span className='caption-sm pointer-events-none absolute left-1/2 top-1/2 mt-[-0.12rem] -translate-x-1/2 -translate-y-1/2 font-kanit font-medium'>
          {records.averages.length + records.singles.length}
        </span>
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

function DeveloperBadge() {
  return (
    <HoverPopover
      content='vscubing developer'
      contentProps={{ className: 'border-b-2 border-primary-100' }}
      asChild
    >
      <span className='inline-flex h-5 w-5 items-center justify-center gap-0.5 rounded-md text-xs font-semibold text-primary-60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'>
        <CodeXmlIcon />
      </span>
    </HoverPopover>
  )
}
