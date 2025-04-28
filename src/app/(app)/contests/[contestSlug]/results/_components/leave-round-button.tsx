'use client'

import { PrimaryButton } from '@/frontend/ui'
import { useTRPC } from '@/trpc/react'
import type { Discipline } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function LeaveRoundButton({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const trpc = useTRPC()
  const { data: sessions } = useQuery(
    trpc.contest.getContestResults.queryOptions({
      contestSlug,
      discipline,
    }),
  )
  const queryClient = useQueryClient()
  const { mutateAsync: deleteSession } = useMutation(
    trpc.roundSession.delete.mutationOptions({
      onSettled: () =>
        void queryClient.invalidateQueries(
          trpc.contest.getContestResults.queryOptions({
            contestSlug,
            discipline,
          }),
        ),
    }),
  )
  if (!sessions) return

  const ownSession = sessions.find(({ session }) => session.isOwn)
  if (ownSession && ownSession.solves.length === 0)
    return (
      <PrimaryButton
        onClick={() => deleteSession({ contestSlug, discipline })}
        className='ml-auto sm:hidden'
      >
        Leave round
      </PrimaryButton>
    )
}
