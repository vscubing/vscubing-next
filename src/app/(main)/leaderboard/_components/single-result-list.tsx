'use client'

import { HintSection } from '@/app/_shared/HintSection'
import { type Discipline } from '@/app/_types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { SingleResult, SingleResultListShell } from './single-result'

export function SingleResultList({
  discipline,
  initialData,
}: {
  discipline: Discipline
  initialData?: RouterOutputs['leaderboard']['bySingle']
}) {
  const trpc = useTRPC()
  const { data: results } = useSuspenseQuery(
    trpc.leaderboard.bySingle.queryOptions(
      {
        discipline,
      },
      { initialData },
    ),
  )

  if (results.length === 0) {
    return (
      <HintSection>
        While this page may be empty now, it's brimming with potential for
        thrilling contests that will soon fill this
      </HintSection>
    )
  }

  return (
    <SingleResultListShell>
      {/* TODO: pagination */}
      {results.map((result, idx) => (
        <SingleResult
          {...result}
          discipline={discipline}
          place={idx + 1}
          key={result.id}
        />
      ))}
    </SingleResultListShell>
  )
}
