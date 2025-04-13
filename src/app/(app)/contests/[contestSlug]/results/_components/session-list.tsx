'use client'
import { HintSection } from '@/frontend/shared/hint-section'
import { type Discipline } from '@/types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { useRef, type ReactNode, type RefObject } from 'react'
import { Session } from './session'

export function SessionList({
  contestSlug,
  discipline,
  initialData,
}: {
  contestSlug: string
  discipline: Discipline
  initialData?: RouterOutputs['contest']['getContestResults']
}) {
  const trpc = useTRPC()
  const { data: sessions } = useSuspenseQuery(
    trpc.contest.getContestResults.queryOptions(
      {
        contestSlug,
        discipline,
      },
      { initialData },
    ),
  )

  const stickyItemIdx = sessions.findIndex((result) => result.session.isOwn)

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

  if (sessions.length === 0) {
    return (
      <HintSection>
        <p>It seems no one participated in this round</p>
      </HintSection>
    )
  }

  return (
    <SessionListShell>
      {sessions.map((session, idx) => {
        let ref: RefObject<HTMLLIElement | null> | undefined = undefined
        if (idx === stickyItemIdx + 1) {
          ref = afterStickyItemRef
        } else if (idx === stickyItemIdx - 1) {
          ref = beforeStickyItemRef
        }

        return idx === stickyItemIdx ? (
          <Session
            session={sessions[stickyItemIdx]!}
            place={stickyItemIdx + 1}
            contestSlug={contestSlug}
            discipline={discipline}
            isFirstOnPage={false}
            className='sticky bottom-[-2px] top-[calc(var(--layout-section-header-height)-2px)] z-10'
            key={session.session.id}
            onPlaceClick={scrollToSticky}
          />
        ) : (
          <Session
            session={session}
            contestSlug={contestSlug}
            discipline={discipline}
            isFirstOnPage={idx === 0}
            place={idx + 1}
            key={session.session.id}
            ref={ref}
          />
        )
      })}
    </SessionListShell>
  )
}

export function SessionListShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <div className='flex whitespace-nowrap px-2 text-grey-40 md:hidden'>
        <span className='mr-2 w-11 text-center'>Place</span>
        <span className='mr-2'>Type</span>
        <span className='flex-1'>Nickname</span>
        <span className='mr-4 w-24 text-center'>Average time</span>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className='mr-2 w-24 text-center last:mr-0'>
            Attempt {index + 1}
          </span>
        ))}
      </div>

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
