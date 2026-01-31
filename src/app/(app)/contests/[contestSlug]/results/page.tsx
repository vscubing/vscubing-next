'use client'

import { LayoutSectionHeader } from '@/app/(app)/_layout'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { LayoutPageTitleMobile } from '@/app/(app)/_layout/layout-page-title-mobile'
import { DisciplineSwitcher } from '@/frontend/shared/discipline-switcher'
import { HintSection } from '@/frontend/shared/hint-section'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { PrimaryButton, SecondaryButton } from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import { DEFAULT_DISCIPLINE, isDiscipline, type Discipline } from '@/types'
import { formatContestDuration } from '@/lib/utils/format-date'
import { redirect, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { SessionList } from './_components/session-list'
import { LeaveRoundButton } from './_components/leave-round-button'
import { JoinRoundButton } from './_components/join-round-button'
import { ClassicSolveViewLink } from './_components/classic-solve-view-link'
import {
  RoundSessionHeader,
  RoundSessionRowSkeleton,
} from '@/frontend/shared/round-session-row'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSuspenseUser } from '@/frontend/shared/use-user'
import { SignInButton } from '@/frontend/shared/sign-in-button'

export default function ContestResultsPage() {
  const { contestSlug } = useParams<{ contestSlug: string }>()
  const searchParams = useSearchParams()

  const discipline = searchParams.get('discipline')
  const scrollToId = searchParams.get('scrollToId')
  const scrollToOwn = searchParams.get('scrollToOwn')

  if (!isDiscipline(discipline))
    redirect(
      `/contests/${contestSlug}/results?discipline=${DEFAULT_DISCIPLINE}`,
    )

  const trpc = useTRPC()
  const { data: contest } = useSuspenseQuery(
    trpc.contest.getContestMetaData.queryOptions({
      contestSlug,
    }),
  )

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
          <h2 className='title-h2 mb-3 leading-none sm:mb-1'>
            Contest {contestSlug} {contest.isOngoing ? ' (ongoing)' : ''}
          </h2>
          <p className='min-w-1 text-grey-40'>
            {formatContestDuration(contest)}
          </p>
        </div>
        <div className='ml-auto flex items-center gap-4 whitespace-nowrap sm:hidden'>
          <JoinRoundButton contestSlug={contestSlug} discipline={discipline}>
            {(onClick) => (
              <PrimaryButton
                onClick={onClick}
                size='sm'
                className='h-15'
                autoFocus
              >
                Join this round
              </PrimaryButton>
            )}
          </JoinRoundButton>
          <LeaveRoundButton contestSlug={contestSlug} discipline={discipline} />
          <ClassicSolveViewLink
            contestSlug={contestSlug}
            discipline={discipline}
          >
            {(href) => (
              <SecondaryButton asChild>
                <Link href={href}>Classic solve view</Link>
              </SecondaryButton>
            )}
          </ClassicSolveViewLink>
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
          scrollToId={scrollToId ? Number(scrollToId) : undefined}
          scrollToOwn={Boolean(scrollToOwn)}
          isOngoing={contest.isOngoing}
        />
      </Suspense>
    </>
  )
}

function PageContent({
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
  const trpc = useTRPC()
  const { data: sessions } = useSuspenseQuery(
    trpc.contest.getContestResults.queryOptions({
      contestSlug,
      discipline,
    }),
  )
  const { user } = useSuspenseUser()

  if (sessions.length === 0) {
    if (isOngoing)
      return (
        <HintSection>
          <div>
            <p className='mb-2'>Be the first to participate in this round!</p>
            {user ? (
              <JoinRoundButton
                contestSlug={contestSlug}
                discipline={discipline}
              >
                {(onClick) => (
                  <SecondaryButton onClick={onClick} size='sm'>
                    Join this round
                  </SecondaryButton>
                )}
              </JoinRoundButton>
            ) : (
              <SignInButton variant='primary' />
            )}
          </div>
        </HintSection>
      )
    else
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
