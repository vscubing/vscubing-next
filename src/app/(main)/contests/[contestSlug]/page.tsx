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
        <Suspense key={discipline} fallback={123}>
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
  const { data: contests, error } = await tryCatchTRPC(
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

  if (contests.items?.length === 0) {
    return (
      <HintSection>
        <p>
          While this page may be empty now, it&apos;s brimming with potential
          for thrilling contests that will soon fill this space.
        </p>
      </HintSection>
    )
  }

  return (
    <ContestListWrapper>
      <HydrateClient>
        123
        {/* <ContestList initialData={contests} discipline={discipline} /> */}
      </HydrateClient>
    </ContestListWrapper>
  )
}

function ContestListWrapper({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      {/* <ContestsListHeader className='sm:hidden' /> */}

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
