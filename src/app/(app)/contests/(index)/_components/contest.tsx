import { type ContestMetadata, type Discipline } from '@/types'
import { DisciplineIcon, SecondaryButton } from '@/frontend/ui'
import { formatContestDuration } from '@/lib/utils/format-date'
import Link from 'next/link'
import { cn } from '@/frontend/utils/cn'
import tailwindConfig from 'tailwind.config'
import { SpinningBorder } from '@/frontend/ui/spinning-border'

export {
  Contest as ContestRowMobile,
  ContestSkeleton as ContestRowSkeletonMobile,
} from '@/frontend/shared/contest'

type ContestProps = {
  contest: ContestMetadata
  discipline?: Discipline
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
    <SpinningBorder
      color={tailwindConfig.theme.colors.secondary[60]}
      enabled={contest.isOngoing}
      className='rounded-xl'
    >
      <div
        className={cn(
          'text-large flex h-16 items-center justify-between rounded-xl pl-4',
          contest.isOngoing ? 'bg-secondary-80' : 'bg-grey-100',
          className,
        )}
        style={{ height }}
      >
        {discipline && (
          <DisciplineIcon discipline={discipline} className='mr-4' />
        )}
        <span className='vertical-alignment-fix relative mr-4 flex-1 pr-4 after:absolute after:right-0 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60'>
          Contest {contest.slug} {contest.isOngoing && '(ongoing)'}
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
    </SpinningBorder>
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
      className={cn('h-16 animate-pulse rounded-xl bg-grey-100', className)}
      style={{ height }}
    ></div>
  )
}
