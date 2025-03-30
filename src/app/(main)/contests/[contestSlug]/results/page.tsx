import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/app/_types'
import { api, HydrateClient } from '@/trpc/server'
import { redirect } from 'next/navigation'
import { formatContestDuration } from '@/app/_utils/formatDate'
import { Header, SectionHeader } from '@/app/_components/layout'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { PageTitleMobile } from '@/app/_shared/PageTitleMobile'
import { Suspense, type ReactNode } from 'react'
import { tryCatchTRPC } from '@/app/_utils/try-catch'
import { HintSection } from '@/app/_shared/HintSection'
import { Session, SessionSkeleton } from './_components/session'

export default async function ContestResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await params
  const awaitedSearch = await searchParams
  const discipline = awaitedSearch.discipline ?? DEFAULT_DISCIPLINE
  if (!isDiscipline(discipline)) redirect(`/contests/${contestSlug}`)

  const contest = await api.contest.getContestMetaData({ contestSlug })

  let title = ''
  if (contest.isOngoing) {
    title = `Ongoing contest (${formatContestDuration(contest)})`
  } else {
    title = 'Look through the contest results'
  }

  return (
    <HydrateClient>
      <section className='flex flex-1 flex-col gap-3 sm:gap-2'>
        <Header title={title} />
        <PageTitleMobile>{title}</PageTitleMobile>
        <NavigateBackButton className='self-start' />
        <SectionHeader>
          <DisciplineSwitcher initialDiscipline={discipline} />
        </SectionHeader>
        <Suspense
          key={discipline}
          fallback={
            <SessionListWrapper>
              {Array.from({ length: 20 }).map((_, idx) => (
                <li key={idx}>
                  <SessionSkeleton />
                </li>
              ))}
            </SessionListWrapper>
          }
        >
          <PageContent contestSlug={contestSlug} discipline={discipline} />
        </Suspense>
      </section>
    </HydrateClient>
  )
}

async function PageContent({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const { data: sessions, error } = await tryCatchTRPC(
    api.contest.getContestResults({
      contestSlug,
      discipline,
    }),
  )

  if (error?.code === 'UNAUTHORIZED')
    return (
      <HintSection>
        <p>{error.message}</p>
      </HintSection>
    )

  if (error?.code === 'FORBIDDEN') return 'forbidden'
  if (error) throw error

  if (sessions.items?.length === 0) {
    return (
      <HintSection>
        <p>It seems no one participated in this round</p>
      </HintSection>
    )
  }

  return (
    <SessionListWrapper>
      {/* <HydrateClient> */}

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

      {/* </HydrateClient> */}
    </SessionListWrapper>
  )
}

function SessionListWrapper({ children }: { children: ReactNode }) {
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
