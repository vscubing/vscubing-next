import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/app/_types'
import { db } from '@/server/db'
import {
  usersTable,
  contestsToDisciplinesTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
} from '@/server/db/schema'
import { api, HydrateClient } from '@/trpc/server'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { formatContestDuration } from '@/app/_utils/formatDate'
import { Header, SectionHeader } from '@/app/_components/layout'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { PageTitleMobile } from '@/app/_shared/PageTitleMobile'
import { Suspense } from 'react'

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
          <PageContent discipline={discipline} />
        </Suspense>
      </section>
    </HydrateClient>
  )
}

function PageContent({ discipline }: { discipline: Discipline }) {
  // const results = api.contests.
  return 'pageContent'
}
