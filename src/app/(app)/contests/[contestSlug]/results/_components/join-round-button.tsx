'use client'

import { useTRPC } from '@/lib/trpc/react'
import { type Discipline } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function JoinRoundButton({
  contestSlug,
  discipline,
  children,
}: {
  contestSlug: string
  discipline: Discipline
  children: (onClick: () => void) => React.ReactNode
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const roundPermissionsQuery = trpc.roundSession.roundPermissions.queryOptions(
    {
      contestSlug,
      discipline,
    },
  )

  const { data: permissions } = useQuery(roundPermissionsQuery)

  const contestResultsQuery = trpc.contest.getContestResults.queryOptions({
    contestSlug,
    discipline,
  })

  const { mutate: createRoundSession } = useMutation(
    trpc.roundSession.create.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries(contestResultsQuery)
        void queryClient.invalidateQueries(roundPermissionsQuery)
        void queryClient.invalidateQueries(
          trpc.roundSession.state.queryOptions({
            contestSlug,
            discipline,
          }),
        )
      },
    }),
  )

  if (!permissions?.canJoinRound) return null

  return children(() => createRoundSession({ contestSlug, discipline }))
}
