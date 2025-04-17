'use client'
import { HintSection } from '@/frontend/shared/hint-section'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { useCallback, useEffect, type ReactNode } from 'react'
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
  scrollToId,
}: {
  contestSlug: string
  discipline: Discipline
  initialData?: RouterOutputs['contest']['getContestResults']
  scrollToId?: number
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
  const scrollAndGlow = useCallback(
    (idx: number) => {
      const item = containerRef.current?.children[idx]
      if (!item) return
      item.classList.add('animate-glow')
      performScrollToIdx(idx)
      setTimeout(() => item?.classList.remove('animate-glow'), 2000)
    },
    [containerRef, performScrollToIdx],
  )

  useEffect(() => {
    if (scrollToId)
      scrollAndGlow(
        sessions.findIndex((result) => result.session.id === scrollToId),
      )
  }, [scrollToId, sessions, scrollAndGlow])

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
            podiumColors
            isFirstOnPage={false}
            className={cn('rounded-xl', {
              'sticky bottom-[-2px] top-[calc(var(--layout-section-header-height)-2px)] z-10':
                idx === stickyItemIdx,
            })}
            key={session.session.id}
            onPlaceClick={
              idx === stickyItemIdx
                ? () => scrollAndGlow(stickyItemIdx)
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
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
      <RoundSessionHeader />

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
