'use client'

import { SecondaryButton } from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import type { Discipline } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function LeaveRoundButton({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const queryClient = useQueryClient()
  const trpc = useTRPC()
  const canLeaveRoundQuery = trpc.roundSession.canLeaveRound.queryOptions({
    contestSlug,
    discipline,
  })

  const { data: canLeaveRound } = useQuery(canLeaveRoundQuery)

  const { mutateAsync: deleteSession } = useMutation(
    trpc.roundSession.leaveRound.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.contest.getContestResults.queryOptions({
            contestSlug,
            discipline,
          }),
        )
        void queryClient.invalidateQueries(canLeaveRoundQuery)
        void queryClient.invalidateQueries(
          trpc.roundSession.hasJoinedRound.queryOptions({
            contestSlug,
            discipline,
          }),
        )
      },
    }),
  )

  if (canLeaveRound)
    return (
      <SecondaryButton
        onClick={() => deleteSession({ contestSlug, discipline })}
      >
        Leave round
      </SecondaryButton>
    )
}
