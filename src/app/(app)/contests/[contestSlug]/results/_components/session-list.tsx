'use client'

import {
  RoundSessionHeader,
  RoundSessionRow,
} from '@/frontend/shared/round-session-row'
import { SignInButton } from '@/frontend/shared/sign-in-button'
import { useUser } from '@/frontend/shared/use-user'
import { PrimaryButton } from '@/frontend/ui'
import { cn } from '@/frontend/utils/cn'
import { useScrollToIndex } from '@/frontend/utils/use-scroll-to-index'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { type Discipline } from '@/types'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

export function SessionList({
  contestSlug,
  discipline,
  initialData,
  scrollToId,
  scrollToOwn,
}: {
  contestSlug: string
  discipline: Discipline
  initialData?: RouterOutputs['contest']['getContestResults']
  scrollToId?: number
  scrollToOwn?: boolean
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

  const queryClient = useQueryClient()
  const { mutate: createRoundSession } = useMutation(
    trpc.roundSession.create.mutationOptions({
      onSettled: () =>
        queryClient.refetchQueries(
          // TODO: we probably should be revalidating queryKeys and not queries
          trpc.contest.getContestResults.queryOptions({
            contestSlug,
            discipline,
          }),
        ),
    }),
  )

  const ownSessionIdx = sessions.findIndex((result) => result.session.isOwn)
  const { user } = useUser()
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
      <RoundSessionHeader />
      {ownSessionIdx === -1 &&
        (user ? (
          <PrimaryButton
            size='sm'
            onClick={() => createRoundSession({ contestSlug, discipline })}
            autoFocus
          >
            Join this round!
          </PrimaryButton>
        ) : (
          <SignInButton variant='primary' />
        ))}
      <ul ref={containerRef} className='space-y-2'>
        {sessions.map((session, idx) => (
          <RoundSessionRow
            session={session}
            place={idx + 1}
            discipline={discipline}
            podiumColors
            isFirstOnPage={idx === 0}
            className={cn('rounded-xl', {
              'sticky bottom-[-2px] top-[calc(var(--layout-section-header-height)-2px)] z-10':
                idx === ownSessionIdx,
            })}
            key={session.session.id}
            onPlaceClick={
              idx === ownSessionIdx
                ? () => scrollAndGlow(ownSessionIdx)
                : undefined
            }
          />
        ))}
      </ul>
    </div>
  )
}
