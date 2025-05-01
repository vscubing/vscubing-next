'use client'

import { SecondaryButton } from '@/frontend/ui'
import { NoSSR } from '@/frontend/utils/no-ssr'
import { useTRPC } from '@/lib/trpc/react'
import type { Discipline } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ComponentPropsWithoutRef } from 'react'

// NOTE: we disable SSR on this component because it needs getContestResults, which we have to prefetch to prevent hydration error (mismatch because auth isn't available for fetching in 'use client' during SSR), but prefetching it is tedious so we do this for now
export function LeaveRoundButton(
  props: ComponentPropsWithoutRef<typeof Component>,
) {
  return (
    <NoSSR>
      {/* TODO: refactor this to withNoSSR */}
      <Component {...props} />
    </NoSSR>
  )
}

function Component({
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
