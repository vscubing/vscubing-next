import { LayoutSectionHeader } from '@/app/(app)/_layout'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { LayoutPageTitleMobile } from '@/app/(app)/_layout/layout-page-title-mobile'
import { DisciplineSwitcher } from '@/frontend/shared/discipline-switcher'
import { HintSection } from '@/frontend/shared/hint-section'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { api } from '@/lib/trpc/server'
import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/types'
import { formatContestDuration } from '@/lib/utils/format-date'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SessionList } from './_components/session-list'
import { LeaveRoundButton } from './_components/leave-round-button'
import { JoinRoundButton } from './_components/join-round-button'
import { ClassicSolveViewLink } from './_components/legacy-solve-page-link'
import {
  RoundSessionHeader,
  RoundSessionRowSkeleton,
} from '@/frontend/shared/round-session-row'

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

  const { data: contest, error } = await tryCatchTRPC(
    api.contest.getContestMetaData({
      contestSlug,
    }),
  )
  if (error?.code === 'NOT_FOUND') notFound()
  if (error) throw error

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
          <h2 className='title-h2 mb-1'>
            Contest {contestSlug} {contest.isOngoing ? ' (ongoing)' : ''}
          </h2>
          <p className='min-w-1 text-grey-40'>
            {formatContestDuration(contest)}
          </p>
        </div>
        <div className='ml-auto flex gap-2 whitespace-nowrap sm:hidden'>
          <JoinRoundButton contestSlug={contestSlug} discipline={discipline} />
          <LeaveRoundButton contestSlug={contestSlug} discipline={discipline} />
          <ClassicSolveViewLink
            contestSlug={contestSlug}
            discipline={discipline}
          />
        </div>
      </LayoutSectionHeader>

      <Suspense
        key={discipline}
        fallback={
          <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
            <RoundSessionHeader />
            <div className='space-y-2'>
              {Array.from({ length: 20 }).map((_, idx) => (
                <RoundSessionRowSkeleton key={idx} />
              ))}
            </div>
          </div>
        }
      >
        <PageContent
          contestSlug={contestSlug}
          discipline={discipline}
          scrollToId={Number(scrollToId)}
          scrollToOwn={Boolean(scrollToOwn)}
          isOngoing={contest.isOngoing}
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
  isOngoing,
}: {
  contestSlug: string
  discipline: Discipline
  scrollToId?: number
  scrollToOwn?: boolean
  isOngoing: boolean
}) {
  let sessions = await api.contest.getContestResults({
    contestSlug,
    discipline,
  })

  if (!isOngoing)
    sessions = sessions.filter((session) => session.session.isFinished) // TODO: remove this when we implement autocompleting all incomplete sessions on contest end

  if (sessions.length === 0 && !isOngoing) {
    return (
      <HintSection>
        <p>It seems no one participated in this round.</p>
      </HintSection>
    )
  }

  return (
    <SessionList
      initialData={sessions}
      contestSlug={contestSlug}
      discipline={discipline}
      scrollToId={scrollToId}
      scrollToOwn={scrollToOwn}
      isOngoing={isOngoing}
    />
  )
}
