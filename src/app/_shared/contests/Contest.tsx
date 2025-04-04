import { formatContestDuration } from '@/app/_utils/formatDate'
import { SecondaryButton, ArrowRightIcon } from '@/app/_components/ui'
import { type Discipline } from '@/app/_types'
import type { contestTable } from '@/server/db/schema'
import Link from 'next/link'
import { cn } from '@/app/_utils/cn'

type ContestProps = {
  contest: Pick<
    typeof contestTable.$inferSelect,
    'startDate' | 'endDate' | 'expectedEndDate' | 'slug'
  >
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
