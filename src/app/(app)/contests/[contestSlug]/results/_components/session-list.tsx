'use client'

import {
  RoundSessionHeader,
  RoundSessionRow,
} from '@/frontend/shared/round-session-row'
import { useScrollToIndex } from '@/frontend/utils/use-scroll-to-index'
import { useTRPC, type RouterOutputs } from '@/lib/trpc/react'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { OwnRoundSessionInProgressRow } from './own-round-session-in-progress-row'
import { SignInBanner } from './sign-in-banner'
import { PrimaryButton } from '@/frontend/ui'
import { JoinRoundButton } from './join-round-button'

export function SessionList({
  contestSlug,
  discipline,
  initialData,
  scrollToId,
  scrollToOwn,
  isOngoing,
}: {
  contestSlug: string
  discipline: Discipline
  initialData: RouterOutputs['contest']['getContestResults']
  scrollToId?: number
  scrollToOwn?: boolean
  isOngoing: boolean
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
    if (scrollToOwn)
      scrollAndGlow(sessions.findIndex((result) => result.session.isOwn))
  }, [scrollToOwn, sessions, scrollAndGlow])

  useEffect(() => {
    if (scrollToId)
      scrollAndGlow(
        sessions.findIndex((result) => result.session.id === scrollToId),
      )
  }, [scrollToId, sessions, scrollAndGlow])

  const ownSessionIdx = sessions.findIndex((result) => result.session.isOwn)
  const revealedAttemptsNumber = isOngoing
    ? (sessions[ownSessionIdx]?.solves.length ?? 0)
    : 5
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
      <RoundSessionHeader />
      <ul ref={containerRef} className='space-y-2'>
        {sessions.map((session, idx) =>
          session.session.isOwn && !session.session.isFinished ? (
            <OwnRoundSessionInProgressRow
              discipline={discipline}
              session={session}
              place={idx + 1}
              contestSlug={contestSlug}
              key={session.session.id}
            />
          ) : (
            <RoundSessionRow
              session={session}
              place={idx + 1}
              discipline={discipline}
              podiumColors
              isFirstOnPage={idx === 0}
              revealedAttemptsNumber={revealedAttemptsNumber}
              className='rounded-xl'
              sticky={idx === ownSessionIdx}
              key={session.session.id}
              isPlacePreliminary={isOngoing}
              onPlaceClick={
                idx === ownSessionIdx
                  ? () => scrollAndGlow(ownSessionIdx)
                  : undefined
              }
            />
          ),
        )}
      </ul>
      <SignInBanner isOngoing={isOngoing} />
      <JoinRoundButton contestSlug={contestSlug} discipline={discipline}>
        {(onClick) => (
          <PrimaryButton
            onClick={onClick}
            size='sm'
            className='sticky bottom-0 mt-1 h-15'
            autoFocus
          >
            Join this round
          </PrimaryButton>
        )}
      </JoinRoundButton>
    </div>
  )
}
