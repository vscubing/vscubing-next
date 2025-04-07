'use client'
import { HintSection } from '@/app/_shared/HintSection'
import { type Discipline } from '@/app/_types'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { type ReactNode } from 'react'
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

  if (sessions.length === 0) {
    return (
      <HintSection>
        <p>It seems no one participated in this round</p>
      </HintSection>
    )
  }

  const pinnedItemIdx = sessions.findIndex((result) => result.isOwn)

  return (
    <SessionListShell>
      {sessions.map((session, idx) =>
        idx === pinnedItemIdx ? (
          <div
            className='sticky bottom-[-2px] top-[var(--section-header-height)] z-10'
            key={session.id}
          >
            <Session
              session={sessions[pinnedItemIdx]!}
              place={pinnedItemIdx + 1}
              contestSlug={contestSlug}
              discipline={discipline}
              isFirstOnPage={false}
            />
          </div>
        ) : (
          <Session
            session={session}
            contestSlug={contestSlug}
            discipline={discipline}
            isFirstOnPage={idx === 0}
            place={idx + 1}
            key={session.id}
          />
        ),
      )}
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
