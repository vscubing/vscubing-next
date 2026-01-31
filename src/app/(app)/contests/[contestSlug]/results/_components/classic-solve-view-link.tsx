'use client'

import { useTRPC } from '@/lib/trpc/react'
import type { Discipline } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function ClassicSolveViewLink({
  contestSlug,
  discipline,
  children,
}: {
  contestSlug: string
  discipline: Discipline
  children: (href: string) => React.ReactNode
}) {
  const trpc = useTRPC()
  const { data: permissions } = useQuery(
    trpc.roundSession.roundPermissions.queryOptions({
      contestSlug,
      discipline,
    }),
  )

  if (permissions?.sessionInProgress)
    return children(`/contests/${contestSlug}/solve?discipline=${discipline}`)
}
