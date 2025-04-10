import { type ContestMetadata, type Discipline } from '@/types'
import { DisciplineIcon, SecondaryButton } from '@/frontend/ui'
import { formatContestDuration } from '@/utils/format-date'
import Link from 'next/link'
import { cn } from '@/frontend/utils/cn'

export {
  Contest as ContestRowMobile,
  ContestSkeleton as ContestRowSkeletonMobile,
} from '@/frontend/shared/contest'

type ContestProps = {
  contest: ContestMetadata
  discipline: Discipline
  height?: number
  className?: string
}
export function ContestRowDesktop({
  contest,
  discipline,
  height,
  className,
}: ContestProps) {
  return (
    <div
      className={cn(
        'text-large flex h-15 items-center justify-between rounded-xl bg-grey-100 pl-4',
        className,
      )}
      style={{ height }}
    >
      <DisciplineIcon discipline={discipline} className='mr-4' />
      <span className='vertical-alignment-fix relative mr-4 flex-1 pr-4 after:absolute after:right-0 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60'>
        Contest {contest.slug}
      </span>
      <span className='vertical-alignment-fix mr-10 w-44 whitespace-nowrap'>
        {formatContestDuration(contest)}
      </span>
      <SecondaryButton asChild className='h-full'>
        <Link
          href={`/contests/${contest.slug}/results?discipline=${discipline}`}
        >
          view contest
        </Link>
      </SecondaryButton>
    </div>
  )
}

export function ContestRowSkeletonDesktop({
  height,
  className,
}: {
  height?: number
  className?: string
}) {
  return (
    <div
      className={cn('h-15 animate-pulse rounded-xl bg-grey-100', className)}
      style={{ height }}
    ></div>
  )
}
