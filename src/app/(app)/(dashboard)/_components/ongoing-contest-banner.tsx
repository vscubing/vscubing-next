import { PrimaryButton, DisciplineBadge } from '@/frontend/ui'
import { cn } from '@/frontend/utils/cn'
import { formatContestDuration } from '@/lib/utils/format-date'
import { withSuspense } from '@/frontend/utils/with-suspense'
import type { RouterOutputs } from '@/lib/trpc/react'
import { api } from '@/lib/trpc/server'
import Link from 'next/link'
import { DEFAULT_DISCIPLINE } from '@/types'

export const OngoingContestBanner = withSuspense(
  async () => {
    const ongoing = await api.contest.getOngoing()

    return (
      <section className={cn('bg-card-gradient overflow-clip rounded-2xl')}>
        {ongoing ? (
          <>
            <BannerContent className='lg:hidden' ongoing={ongoing} />
            <BannerContentMobile className='hidden lg:flex' ongoing={ongoing} />
          </>
        ) : (
          <BannerOnMaintenance />
        )}
      </section>
    )
  },
  <div className='bg-card-gradient h-44 rounded-2xl sm:h-32'></div>,
)

function BannerContent({
  ongoing,
  className,
}: {
  ongoing: NonNullable<RouterOutputs['contest']['getOngoing']>
  className?: string
}) {
  return (
    <div className={cn('flex h-44', className)}>
      <div className='relative mr-32'>
        <div
          className={cn(
            'xl-short:pt-0 flex h-full flex-col items-start justify-end gap-2 py-4 pl-4',
            className,
          )}
        >
          <p className='title-h3 text-center'>Events</p>
          <Disciplines ongoing={ongoing} />
        </div>
        <Divider className='absolute top-0 -right-32 h-full w-36' />
      </div>

      <div className='relative mr-32'>
        <div className='flex flex-col items-start justify-between gap-4 py-4'>
          <Title />
          <div className='flex w-full items-end justify-between'>
            <div>
              <p className='title-h3 mb-2'>Duration</p>
              <Duration ongoing={ongoing} />
            </div>
            <PrimaryButton asChild className={className}>
              <Link
                href={`/contests/${ongoing.slug}/results?discipline=${DEFAULT_DISCIPLINE}`}
              >
                Solve now
              </Link>
            </PrimaryButton>
          </div>
        </div>
        <Divider className='absolute top-0 -right-40 h-full w-36' />
      </div>
      <ForegroundCubes />
    </div>
  )
}

function BannerContentMobile({
  ongoing,
  className,
}: {
  ongoing: NonNullable<RouterOutputs['contest']['getOngoing']>
  className?: string
}) {
  return (
    <div
      className={cn('flex h-44 sm:h-32 sm:flex-col sm:px-3 sm:py-4', className)}
    >
      <div className='relative z-10 flex flex-col items-start gap-4 py-4 pl-4 sm:gap-4 sm:p-0'>
        <Title />
        <PrimaryButton asChild className='sm:hidden'>
          <Link
            href={`/contests/${ongoing.slug}/results?discipline=${DEFAULT_DISCIPLINE}`}
          >
            Solve now
          </Link>
        </PrimaryButton>
      </div>

      <div className='relative flex-1 sm:hidden'>
        <Divider className='absolute top-0 -right-6 bottom-0 w-[calc(100%+2.5rem)] max-w-64 min-w-32' />
      </div>
      <div className='flex flex-col items-end justify-center gap-6 pr-4 text-right sm:flex-row-reverse sm:items-center sm:justify-end sm:gap-2 sm:p-0 sm:text-left'>
        <div className='space-y-3 sm:space-y-1'>
          <p className='title-h3'>Duration</p>
          <Duration ongoing={ongoing} />
        </div>
        <Disciplines ongoing={ongoing} />
      </div>
    </div>
  )
}

function BannerOnMaintenance() {
  return (
    <div className='flex h-44 gap-60 sm:h-32'>
      <div className='relative py-6 pl-4 sm:px-3 sm:py-4'>
        <div>
          <Title className='mb-3 sm:mb-2' />
          <p className='title-h3'>Currently down for maintenance</p>
        </div>
        <Divider className='absolute top-0 -right-28 h-full w-28 sm:hidden' />
      </div>
      <ForegroundCubes className='sm:hidden' />
    </div>
  )
}

function Duration({
  ongoing,
}: {
  ongoing: NonNullable<RouterOutputs['contest']['getOngoing']>
}) {
  const duration = formatContestDuration(ongoing)
  return duration ? (
    <p className='text-base'>{duration}</p>
  ) : (
    <p className='bg-grey-100 text-grey-100 w-36 animate-pulse text-base'>
      Loading...
    </p>
  )
}

function Disciplines({
  ongoing,
}: {
  ongoing: NonNullable<RouterOutputs['contest']['getOngoing']>
}) {
  return (
    <div className='flex gap-2'>
      {ongoing.disciplines.map((discipline) => {
        return (
          <Link
            href={`/contests/${ongoing.slug}/results?discipline=${discipline}`}
            className='outline-ring group flex flex-col gap-2'
            key={discipline}
          >
            <DisciplineBadge
              discipline={discipline}
              className='transition-base outline-ring group-hover:bg-secondary-40 group-active:bg-secondary-20'
            />
            <span className='btn-lg text-center lg:hidden'>
              {discipline.replace('by', 'x')}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-black-100 pointer-events-none [clip-path:polygon(max(calc(100%_-_7px),0px)_0,100%_0%,7px_100%,0%_100%)]',
        className,
      )}
    ></div>
  )
}

function Title({ className }: { className?: string }) {
  return (
    <h2 className={cn('title-lg', className)}>
      <span className='text-secondary-20'>Ongoing</span> Contest
    </h2>
  )
}

function ForegroundCubes({ className }: { className?: string }) {
  return (
    <div className={cn('@container relative flex-1', className)}>
      <div className='@[4rem]:bg-dashboard-banner-cubes @[20rem]:bg-dashboard-banner-cubes-wide absolute top-0 -left-10 h-full w-[calc(100%+20*(.25rem))] bg-[length:auto_100%]'></div>
    </div>
  )
}
