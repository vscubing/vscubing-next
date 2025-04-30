'use client'

import { SecondaryButton } from '@/frontend/ui'
import { NoSSR } from '@/frontend/utils/no-ssr'
import { useTRPC } from '@/lib/trpc/react'
import type { Discipline } from '@/types'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

// NOTE: we disable SSR on this component because it needs getContestResults, which we have to prefetch to prevent hydration error (mismatch because auth isn't available for fetching in 'use client' during SSR), but prefetching it is tedious so we do this for now
export function LegacySolvePageLink(
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
  const trpc = useTRPC()
  const { isLoading, error } = useQuery(
    trpc.roundSession.state.queryOptions(
      {
        contestSlug,
        discipline,
      },
      { retry: false },
    ),
  )

  if (!isLoading && !error)
    return (
      <SecondaryButton asChild>
        <Link href={`/contests/${contestSlug}/solve?discipline=${discipline}`}>
          Legacy solve view
        </Link>
      </SecondaryButton>
    )
}
