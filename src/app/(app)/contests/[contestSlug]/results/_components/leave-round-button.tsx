'use client'

import { SecondaryButton } from '@/frontend/ui'
import { NoSSR } from '@/frontend/utils/no-ssr'
import { useTRPC } from '@/trpc/react'
import type { Discipline } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ComponentPropsWithoutRef } from 'react'

// NOTE: we disable SSR on this component because it needs getContestResults, which we have to prefetch to prevent hydration error (mismatch because auth isn't available for fetching in 'use client' during SSR), but prefetching it is tedious so we do this for now
export function LeaveRoundButton(
  props: ComponentPropsWithoutRef<typeof Component>,
) {
  return (
    <NoSSR>
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
      <SecondaryButton
        onClick={() => deleteSession({ contestSlug, discipline })}
        className='ml-auto sm:hidden'
      >
        Leave round
      </SecondaryButton>
    )
}
