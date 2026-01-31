'use client'

import { useUser } from '@/frontend/shared/use-user'
import { PrimaryButton } from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import { type Discipline } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function JoinRoundButton({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const { user, isLoading: isUserLoading } = useUser()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const contestResultsQuery = trpc.contest.getContestResults.queryOptions({
    contestSlug,
    discipline,
  })

  const { data: sessions, isLoading: isSessionsLoading } =
    useQuery(contestResultsQuery)

  const { mutate: createRoundSession } = useMutation(
    trpc.roundSession.create.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(contestResultsQuery)
        void queryClient.invalidateQueries(
          trpc.roundSession.canLeaveRound.queryOptions({
            contestSlug,
            discipline,
          }),
        )
        void queryClient.invalidateQueries(
          trpc.roundSession.state.queryOptions({
            contestSlug,
            discipline,
          }),
        )
        void queryClient.invalidateQueries(
          trpc.roundSession.hasJoinedRound.queryOptions({
            contestSlug,
            discipline,
          }),
        )
        void queryClient.invalidateQueries(
          trpc.roundSession.hasJoinedRound.queryOptions({
            contestSlug,
            discipline,
          }),
        )
      },
    }),
  )

  const hasSession = sessions?.some((result) => result.session.isOwn)
  if (isUserLoading || isSessionsLoading || !user || hasSession) return null

  return (
    <PrimaryButton
      onClick={() => createRoundSession({ contestSlug, discipline })}
      size='sm'
      className='h-15'
      autoFocus
    >
      Join this round
    </PrimaryButton>
  )
}
