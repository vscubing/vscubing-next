import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/app/_types'
import { api } from '@/trpc/server'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { LayoutPageTitleMobile } from '@/app/_shared/layout-page-title-mobile'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { tryCatchTRPC } from '@/app/_utils/try-catch'
import { redirect } from 'next/navigation'
import { HintSignInSection } from '@/app/_shared/HintSection'
import { CONTEST_UNAUTHORIZED_MESSAGE } from '@/shared'
import { SessionList, SessionListShell } from './_components/session-list'
import { LayoutSectionHeader } from '@/app/(main)/_layout'
import { Suspense } from 'react'
import { SessionSkeleton } from './_components/session'

export default async function ContestResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await params
  const discipline = (await searchParams).discipline
  if (!isDiscipline(discipline))
    redirect(
      `/contests/${contestSlug}/results?discipline=${DEFAULT_DISCIPLINE}`,
    )

  const contest = await api.contest.getContestMetaData({ contestSlug })

  let title = ''
  if (contest.isOngoing) {
    title = 'Check out the preliminary results'
  } else {
    title = 'Look through the contest results'
  }
  return (
    <>
      <LayoutPageTitleMobile>{title}</LayoutPageTitleMobile>
      <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
      <NavigateBackButton />
      <LayoutSectionHeader>
        <DisciplineSwitcher
          disciplines={contest.disciplines}
          initialDiscipline={discipline}
        />
      </LayoutSectionHeader>

      <Suspense
        key={discipline}
        fallback={
          <SessionListShell>
            {Array.from({ length: 20 }).map((_, idx) => (
              <li key={idx}>
                <SessionSkeleton />
              </li>
            ))}
          </SessionListShell>
        }
      >
        <Content contestSlug={contestSlug} discipline={discipline} />
      </Suspense>
    </>
  )
}

async function Content({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const { data: initialData, error } = await tryCatchTRPC(
    api.contest.getContestResults({
      contestSlug,
      discipline,
    }),
  )

  if (error?.code === 'UNAUTHORIZED')
    return <HintSignInSection description={CONTEST_UNAUTHORIZED_MESSAGE} />

  if (error?.code === 'FORBIDDEN')
    redirect(`/contests/${contestSlug}/solve?discipline=${discipline}`)

  if (error) throw error

  return (
    <SessionList
      initialData={initialData}
      contestSlug={contestSlug}
      discipline={discipline}
    />
  )
}
