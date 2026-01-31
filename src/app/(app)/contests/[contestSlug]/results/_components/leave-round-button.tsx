'use client'

import { UnderlineButton } from '@/frontend/ui'
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
  const roundPermissionsQuery = trpc.roundSession.roundPermissions.queryOptions(
    {
      contestSlug,
      discipline,
    },
  )

  const { data: permissions } = useQuery(roundPermissionsQuery)

  const { mutateAsync: deleteSession } = useMutation(
    trpc.roundSession.leaveRound.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(
          trpc.contest.getContestResults.queryOptions({
            contestSlug,
            discipline,
          }),
        )
        void queryClient.invalidateQueries(roundPermissionsQuery)
      },
    }),
  )

  if (permissions?.canLeaveRound)
    return (
      <UnderlineButton
        size='sm'
        onClick={() => deleteSession({ contestSlug, discipline })}
      >
        Leave round
      </UnderlineButton>
    )
}
