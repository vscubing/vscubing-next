'use client'

import { HintSection } from '@/frontend/shared/hint-section'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { SingleResult, SingleResultListShell } from './single-result'
import { useRef, type RefObject } from 'react'

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

  const stickyItemIdx = results.findIndex((result) => result.isOwn)

  const beforeStickyItemRef = useRef<HTMLLIElement | null>(null)
  const afterStickyItemRef = useRef<HTMLLIElement | null>(null)
  function scrollToSticky() {
    const afterItem = afterStickyItemRef.current
    const beforeItem = beforeStickyItemRef.current
    const scrollTo = afterItem ?? beforeItem!
    scrollTo.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

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
      {results.map((result, idx) => {
        let ref: RefObject<HTMLLIElement | null> | undefined = undefined
        if (idx === stickyItemIdx + 1) {
          ref = afterStickyItemRef
        } else if (idx === stickyItemIdx - 1) {
          ref = beforeStickyItemRef
        }

        return idx === stickyItemIdx ? (
          <SingleResult
            result={results[stickyItemIdx]!}
            discipline={discipline}
            place={stickyItemIdx + 1}
            className='sticky bottom-[-2px] top-[calc(var(--section-header-height)-2px)] z-10'
            key={result.id}
            onPlaceClick={scrollToSticky}
          />
        ) : (
          <SingleResult
            result={result}
            discipline={discipline}
            place={idx + 1}
            key={result.id}
            ref={ref}
          />
        )
      })}
    </SingleResultListShell>
  )
}
