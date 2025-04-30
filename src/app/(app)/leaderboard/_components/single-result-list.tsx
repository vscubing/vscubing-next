'use client'

import { HintSection } from '@/frontend/shared/hint-section'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/lib/trpc/react'
import { SingleResult, SingleResultListShell } from './single-result'
import { cn } from '@/frontend/utils/cn'
import { useScrollToIndex } from '@/frontend/utils/use-scroll-to-index'

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

  const { containerRef, performScrollToIdx } = useScrollToIndex()

  if (results.length === 0) {
    return (
      <HintSection>
        While this page may be empty now, it's brimming with potential for
        thrilling contests that will soon fill this
      </HintSection>
    )
  }

  const stickyItemIdx = results.findIndex((result) => result.isOwn)
  return (
    <SingleResultListShell>
      <ul className='space-y-2' ref={containerRef}>
        {results.map((result, idx) => (
          <SingleResult
            result={result}
            discipline={discipline}
            place={idx + 1}
            className={cn({
              'sticky bottom-[-2px] top-[calc(var(--layout-section-header-height)-2px)] z-10':
                idx === stickyItemIdx,
            })}
            key={result.id}
            onPlaceClick={
              idx === stickyItemIdx ? () => performScrollToIdx(idx) : undefined
            }
          />
        ))}
      </ul>
    </SingleResultListShell>
  )
}
