import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/types'
import { api } from '@/trpc/server'
import { DisciplineSwitcher } from '@/frontend/shared/discipline-switcher'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { LayoutPageTitleMobile } from '@/app/(app)/_layout/layout-page-title-mobile'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { tryCatchTRPC } from '@/utils/try-catch'
import { redirect } from 'next/navigation'
import { HintSignInSection } from '@/frontend/shared/hint-section'
import { CONTEST_UNAUTHORIZED_MESSAGE } from '@/types'
import { SessionList, SessionListShell } from './_components/session-list'
import { LayoutSectionHeader } from '@/app/(app)/_layout'
import { Suspense } from 'react'
import { RoundSessionRowSkeleton } from '../../../../../frontend/shared/round-session-row'
import { formatContestDuration } from '@/utils/format-date'

export default async function ContestResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await params
  const { discipline, scrollToId, scrollToOwn } = await searchParams
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
      <LayoutSectionHeader className='sticky top-0 z-10 gap-4 sm:gap-2'>
        <DisciplineSwitcher
          disciplines={contest.disciplines}
          initialDiscipline={discipline}
        />
        <div>
          <h2 className='title-h2 mb-1'>Contest {contestSlug}</h2>
          <p className='min-w-1 text-grey-40'>
            {formatContestDuration(contest)}
          </p>
        </div>
      </LayoutSectionHeader>

      <Suspense
        key={discipline}
        fallback={
          <SessionListShell>
            <div className='space-y-2'>
              {Array.from({ length: 20 }).map((_, idx) => (
                <RoundSessionRowSkeleton key={idx} />
              ))}
            </div>
          </SessionListShell>
        }
      >
        <PageContent
          contestSlug={contestSlug}
          discipline={discipline}
          scrollToId={Number(scrollToId)}
          scrollToOwn={Boolean(scrollToOwn)}
        />
      </Suspense>
    </>
  )
}

async function PageContent({
  contestSlug,
  discipline,
  scrollToId,
  scrollToOwn,
}: {
  contestSlug: string
  discipline: Discipline
  scrollToId?: number
  scrollToOwn?: boolean
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
      scrollToId={scrollToId}
      scrollToOwn={scrollToOwn}
    />
  )
}
