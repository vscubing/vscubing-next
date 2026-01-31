'use client'

import { useTRPC } from '@/lib/trpc/react'
import type { Discipline } from '@/types'
import { withSuspense } from '@/frontend/utils/with-suspense'
import { useSuspenseQuery } from '@tanstack/react-query'

export const ClassicSolveViewLink = withSuspense(function ({
  contestSlug,
  discipline,
  children,
}: {
  contestSlug: string
  discipline: Discipline
  children: (href: string) => React.ReactNode
}) {
  const trpc = useTRPC()
  const { data: permissions } = useSuspenseQuery(
    trpc.roundSession.roundPermissions.queryOptions({
      contestSlug,
      discipline,
    }),
  )

  if (permissions?.sessionInProgress)
    return children(`/contests/${contestSlug}/solve?discipline=${discipline}`)
})
