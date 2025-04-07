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

  const pinnedItemIdx = results.findIndex((result) => result.isOwn)

  return (
    <SingleResultListShell>
      {pinnedItemIdx !== -1 && (
        <div className='sticky top-[var(--section-header-height)] z-10 rounded-b-2xl bg-gradient-to-b from-black-80 to-transparent'>
          <SingleResult
            result={results[pinnedItemIdx]!}
            discipline={discipline}
            place={pinnedItemIdx + 1}
          />
        </div>
      )}
      {results.map((result, idx) => (
        <SingleResult
          result={result}
          discipline={discipline}
          place={idx + 1}
          key={result.id}
        />
      ))}
    </SingleResultListShell>
  )
}
