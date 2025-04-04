'use client'

import { UnderlineButton } from '@/app/_components/ui'
import { List, ListWrapper } from '@/app/_shared/autofillHeight/List'
import { useFittingCount } from '@/app/_shared/autofillHeight/useAutofillHeight'
import { Contest, ContestSkeleton } from '@/app/_shared/contests/Contest'
import { DEFAULT_DISCIPLINE } from '@/app/_types'
import { cn } from '@/app/_utils/cn'
import type { RouterOutputs } from '@/trpc/react'
import Link from 'next/link'

const MIN_ITEMS_IF_OVERFLOW = 2
const MOBILE_ITEMS = 2
export function LatestContests({
  className,
  contests,
}: {
  className: string
  contests?: RouterOutputs['contest']['getPastContests']['items']
}) {
  const { fittingCount, containerRef, fakeElementRef } = useFittingCount()

  let countToDisplay = fittingCount ?? 0
  // if (matchesQuery('md')) {
  //   countToDisplay = MOBILE_ITEMS
  // } else if (countToDisplay) {
  countToDisplay = Math.max(countToDisplay, MIN_ITEMS_IF_OVERFLOW)
  // }

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
      <ListWrapper
        className='gap-3'
        renderFakeElement={() => <ContestSkeleton />}
        containerRef={containerRef}
        fakeElementRef={fakeElementRef}
      >
        <List
          renderItem={({ item: contest }) => (
            <Contest
              contest={contest.contest}
              discipline={DEFAULT_DISCIPLINE}
            />
          )}
          renderSkeleton={() => <ContestSkeleton />}
          pageSize={countToDisplay}
          getItemKey={(contest) => contest.contest.slug}
          list={contests?.slice(0, countToDisplay)}
        />
      </ListWrapper>
    </section>
  )
}
