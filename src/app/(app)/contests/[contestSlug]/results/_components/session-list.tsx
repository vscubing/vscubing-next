'use client'

import {
  RoundSessionHeader,
  RoundSessionRow,
} from '@/frontend/shared/round-session-row'
import { SignInButton } from '@/frontend/shared/sign-in-button'
import { useUser } from '@/frontend/shared/use-user'
import { useSolveForm } from '@/frontend/shared/use-solve-form'
import { useScrollToIndex } from '@/frontend/utils/use-scroll-to-index'
import { useTRPC, type RouterOutputs } from '@/lib/trpc/react'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { SimulatorProvider } from '@/app/(app)/contests/[contestSlug]/solve/_components'
import { PrimaryButton } from '@/frontend/ui'

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
      <SignInBanner
        isOngoing={isOngoing}
        hasOwnSession={ownSessionIdx !== -1}
      />
    </div>
  )
}

function OwnRoundSessionInProgressRow({
  discipline,
  session,
  place,
  contestSlug,
}: {
  discipline: Discipline
  session: RouterOutputs['contest']['getContestResults'][number]
  place: number
  contestSlug: string
}) {
  const { state } = useSolveForm({
    contestSlug,
    discipline,
  })

  if (!state?.currentSolve) {
    return (
      <RoundSessionRow
        session={session}
        place={place}
        discipline={discipline}
        podiumColors
        isFirstOnPage={false}
        revealedAttemptsNumber={session.solves.length}
        className='rounded-xl'
        sticky
        isPlacePreliminary
      />
    )
  }

  // If there is a current solve, render the in-progress UI
  return (
    <SimulatorProvider>
      <li className='flex items-center gap-4 rounded-xl bg-secondary-80 px-4 py-3'>
        <span className='title-h3'>You have a solve in progress</span>
        <PrimaryButton
          size='sm'
          onClick={() =>
            (window.location.href = `/contests/${contestSlug}/solve?discipline=${discipline}`)
          }
        >
          Go to solve
        </PrimaryButton>
      </li>
    </SimulatorProvider>
  )
}

function SignInBanner({
  isOngoing,
  hasOwnSession,
}: {
  isOngoing: boolean
  hasOwnSession: boolean
}) {
  const { user, isLoading } = useUser()

  if (!isOngoing || hasOwnSession || user || isLoading) return null

  return (
    <div className='sticky bottom-0 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-secondary-20 bg-secondary-80 px-4 py-5'>
      <span className='title-h3'>To participate in this round:</span>{' '}
      <SignInButton variant='ghost' />
    </div>
  )
}
