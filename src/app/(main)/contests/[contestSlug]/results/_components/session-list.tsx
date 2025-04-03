'use client'
import { HintSection } from '@/app/_shared/HintSection'
import { type Discipline } from '@/app/_types'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/react'
import type { ReactNode } from 'react'
import { Session, SessionSkeleton } from './session'

export function SessionList({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const trpc = useTRPC()
  const { data: sessions } = useQuery(
    trpc.contest.getContestResults.queryOptions({
      contestSlug,
      discipline,
    }),
  )

  if (sessions?.items?.length === 0) {
    return (
      <HintSection>
        <p>It seems no one participated in this round</p>
      </HintSection>
    )
  }

  if (!sessions)
    return (
      <SessionListShell>
        {Array.from({ length: 20 }).map((_, idx) => (
          <li key={idx}>
            <SessionSkeleton />
          </li>
        ))}
      </SessionListShell>
    )

  return (
    <SessionListShell>
      {/* TODO: pagination */}
      {sessions.items.map((session, idx) => (
        <Session
          {...session}
          contestSlug={contestSlug}
          discipline={discipline}
          isFirstOnPage={idx === 0}
          place={idx + 1}
          key={session.id}
        />
      ))}
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
