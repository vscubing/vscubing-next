'use client'

import { HintSection } from '@/frontend/shared/hint-section'
import {
  RoundSessionHeader,
  RoundSessionRow,
  RoundSessionRowSkeleton,
} from '@/frontend/shared/round-session-row'
import { cn } from '@/frontend/utils/cn'
import { useScrollToIndex } from '@/frontend/utils/use-scroll-to-index'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { type ReactNode } from 'react'

export function AverageList({
  discipline,
  initialData,
}: {
  discipline: Discipline
  initialData?: RouterOutputs['leaderboard']['byAverage']
}) {
  const trpc = useTRPC()
  const { data: sessions } = useSuspenseQuery(
    trpc.leaderboard.byAverage.queryOptions(
      {
        discipline,
      },
      { initialData },
    ),
  )

  const { containerRef, performScrollToIdx } = useScrollToIndex()

  if (sessions.length === 0) {
    return (
      <HintSection>
        <p>There are not results here yet.</p>
      </HintSection>
    )
  }

  const stickyItemIdx = sessions.findIndex((result) => result.session.isOwn)
  return (
    <AverageListShell>
      <ul className='space-y-2' ref={containerRef}>
        {sessions.map((session, idx) => (
          <RoundSessionRow
            session={session}
            withContestLink
            place={idx + 1}
            discipline={discipline}
            isFirstOnPage={idx === 0}
            className={cn({
              'sticky bottom-[-2px] top-[calc(var(--layout-section-header-height)-2px)] z-10':
                idx === stickyItemIdx,
            })}
            key={session.session.id}
            onPlaceClick={
              idx === stickyItemIdx
                ? () => performScrollToIdx(stickyItemIdx)
                : undefined
            }
          />
        ))}
      </ul>
    </AverageListShell>
  )
}

export function AverageListShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
      <RoundSessionHeader withContestLink />
      {children}
    </div>
  )
}

export const AverageResultSkeleton = RoundSessionRowSkeleton
