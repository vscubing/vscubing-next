'use client'

import { HintSection } from '@/frontend/shared/hint-section'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { useRef, type ReactNode, type RefObject } from 'react'
import {
  RoundSessionRow,
  RoundSessionHeader,
} from '@/frontend/shared/round-session-row'

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

  const stickyItemIdx = sessions.findIndex((result) => result.session.isOwn)

  const beforeStickyItemRef = useRef<HTMLLIElement | null>(null)
  const afterStickyItemRef = useRef<HTMLLIElement | null>(null)
  function scrollToSticky() {
    const afterItem = afterStickyItemRef.current
    const beforeItem = beforeStickyItemRef.current
    const scrollTo = afterItem ?? beforeItem!
    scrollTo.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  if (sessions.length === 0) {
    return (
      <HintSection>
        <p>It seems no one participated in this round</p>
      </HintSection>
    )
  }

  return (
    <AverageListShell>
      {sessions.map((session, idx) => {
        let ref: RefObject<HTMLLIElement | null> | undefined = undefined
        if (idx === stickyItemIdx + 1) {
          ref = afterStickyItemRef
        } else if (idx === stickyItemIdx - 1) {
          ref = beforeStickyItemRef
        }

        return idx === stickyItemIdx ? (
          <RoundSessionRow
            session={sessions[stickyItemIdx]!}
            place={stickyItemIdx + 1}
            discipline={discipline}
            isFirstOnPage={false}
            className='sticky bottom-[-2px] top-[calc(var(--layout-section-header-height)-2px)] z-10'
            key={session.session.id}
            onPlaceClick={scrollToSticky}
          />
        ) : (
          <RoundSessionRow
            session={session}
            discipline={discipline}
            isFirstOnPage={idx === 0}
            place={idx + 1}
            key={session.session.id}
            ref={ref}
          />
        )
      })}
    </AverageListShell>
  )
}

export function AverageListShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <RoundSessionHeader />

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
