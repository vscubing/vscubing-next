'use client'
import { HintSection } from '@/frontend/shared/hint-section'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import {
  RoundSessionRow,
  RoundSessionHeader,
} from '@/frontend/shared/round-session-row'
import { useScrollToIndex } from '@/frontend/utils/use-scroll-to-index'
import { cn } from '@/frontend/utils/cn'

export function SessionList({
  contestSlug,
  discipline,
  initialData,
}: {
  contestSlug: string
  discipline: Discipline
  initialData?: RouterOutputs['contest']['getContestResults']
}) {
  const trpc = useTRPC()
  const { data: sessions } = useSuspenseQuery(
    trpc.contest.getContestResults.queryOptions(
      {
        contestSlug,
        discipline,
      },
      { initialData },
    ),
  )

  const { containerRef, performScrollToIdx } = useScrollToIndex()

  if (sessions.length === 0) {
    return (
      <HintSection>
        <p>It seems no one participated in this round</p>
      </HintSection>
    )
  }

  const stickyItemIdx = sessions.findIndex((result) => result.session.isOwn)
  return (
    <SessionListShell>
      <ul ref={containerRef} className='space-y-2'>
        {sessions.map((session, idx) => (
          <RoundSessionRow
            session={session}
            place={idx + 1}
            discipline={discipline}
            isFirstOnPage={false}
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
    </SessionListShell>
  )
}

export function SessionListShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <RoundSessionHeader />

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
