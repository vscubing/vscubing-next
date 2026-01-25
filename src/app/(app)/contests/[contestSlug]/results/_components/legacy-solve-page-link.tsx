'use client'

import { SecondaryButton } from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import type { Discipline } from '@/types'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export function ClassicSolveViewLink({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const trpc = useTRPC()
  const { data: hasJoinedRound } = useQuery(
    trpc.roundSession.hasJoinedRound.queryOptions({
      contestSlug,
      discipline,
    }),
  )

  if (hasJoinedRound)
    return (
      <SecondaryButton asChild>
        <Link href={`/contests/${contestSlug}/solve?discipline=${discipline}`}>
          Classic solve view
        </Link>
      </SecondaryButton>
    )
}
