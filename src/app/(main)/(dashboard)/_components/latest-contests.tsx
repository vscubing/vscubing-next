'use client'

import { UnderlineButton } from '@/app/_components/ui'
import { useFittingCount } from '@/app/_shared/autofillHeight/use-fitting-count'
import { Contest, ContestSkeleton } from '@/app/_shared/contests/Contest'
import { DEFAULT_DISCIPLINE } from '@/types'
import { cn } from '@/app/_utils/cn'
import { useMatchesScreen } from '@/app/_utils/tailwind'
import type { RouterOutputs } from '@/trpc/react'
import Link from 'next/link'

const MIN_ITEM_COUNT = 2
export function LatestContests({
  className,
  contests,
}: {
  className: string
  contests?: RouterOutputs['contest']['getPastContests']['items']
}) {
  const { fittingCount, containerRef, fakeElementRef } = useFittingCount()
  const isMd = useMatchesScreen('md')

  const countToDisplay = isMd
    ? MIN_ITEM_COUNT
    : Math.max(fittingCount ?? MIN_ITEM_COUNT, MIN_ITEM_COUNT)

  let allDisplayed = undefined
  if (!!countToDisplay && contests?.length) {
    allDisplayed = contests.length <= countToDisplay
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-6 rounded-2xl bg-black-80 px-6 py-4 sm:gap-4 sm:p-3',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <h2 className='title-h3'>Latest contests</h2>
        <UnderlineButton
          asChild
          className={cn('whitespace-nowrap', { invisible: allDisplayed })}
          aria-hidden={allDisplayed}
        >
          <Link href={`/contests?discipline=${DEFAULT_DISCIPLINE}`}>
            View all
          </Link>
        </UnderlineButton>
      </div>
      <ul className='flex flex-1 flex-col gap-3' ref={containerRef}>
        <li aria-hidden className='invisible fixed' ref={fakeElementRef}>
          <ContestSkeleton />
        </li>
        {contests
          ? contests.slice(0, countToDisplay).map((contest) => (
              <li key={contest.slug}>
                <Contest contest={contest} discipline={DEFAULT_DISCIPLINE} />
              </li>
            ))
          : Array.from({ length: countToDisplay }).map((_, idx) => (
              <li key={idx}>
                <ContestSkeleton />
              </li>
            ))}
      </ul>
    </section>
  )
}
