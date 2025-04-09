import { SecondaryButton, ArrowRightIcon } from '@/frontend/ui'
import { type ContestMetadata, type Discipline } from '@/types'
import Link from 'next/link'
import { cn } from '@/frontend/utils/cn'
import { formatContestDuration } from '@/utils/format-date'

type ContestProps = {
  contest: ContestMetadata
  discipline: Discipline
  className?: string
}
export function Contest({ contest, discipline, className }: ContestProps) {
  return (
    <div
      className={cn(
        'flex min-h-16 items-center justify-between gap-8 rounded-xl bg-grey-100 pl-4',
        className,
      )}
    >
      <div className='sm:space-y-2'>
        <p className='title-h3'>Contest {contest.slug}</p>
        <p className='text-grey-40'>{formatContestDuration(contest)}</p>
      </div>
      <SecondaryButton size='iconLg' asChild className='sm:h-16 sm:w-16'>
        <Link
          href={{
            pathname: `/contests/${contest.slug}/results`,
            query: { discipline },
          }}
          aria-label={`Contest ${contest.slug}`}
        >
          <ArrowRightIcon />
        </Link>
      </SecondaryButton>
    </div>
  )
}

export function ContestSkeleton({
  height,
  className,
}: {
  height?: number
  className?: string
}) {
  return (
    <div
      className={cn('min-h-16 animate-pulse rounded-xl bg-grey-100', className)}
      style={{ height }}
    ></div>
  )
}
