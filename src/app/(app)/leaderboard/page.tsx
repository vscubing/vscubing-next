import {
  castDiscipline,
  castLeaderboardType,
  isDiscipline,
  isLeaderboardType,
  type Discipline,
  type LeaderboardType,
} from '@/types'
import { api } from '@/trpc/server'
import { DisciplineSwitcher } from '@/frontend/shared/discipline-switcher-client'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import {
  LayoutPageTitleMobile,
  LayoutPageTitleMobileFallback,
} from '@/frontend/shared/layout-page-title-mobile'
import {
  LayoutHeaderTitlePortal,
  LayoutHeaderTitlePortalFallback,
} from '@/app/(app)/_layout/layout-header'
import { redirect } from 'next/navigation'
import { DISCIPLINES } from '@/types'
import { SingleResultList } from './_components/single-result-list'
import { LayoutSectionHeader } from '@/app/(app)/_layout'
import { Suspense } from 'react'
import { auth } from '@/backend/auth'
import {
  SingleResultListShell,
  SingleResultSkeleton,
} from './_components/single-result'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { discipline, type: type } = await searchParams
  if (!isDiscipline(discipline) || !isLeaderboardType(type))
    redirect(
      `/leaderboard?discipline=${castDiscipline(discipline)}&type=${castLeaderboardType(type)}`,
    )

  return (
    <>
      <Suspense fallback={<PageTitleFallback />}>
        <PageTitle type={type} />
      </Suspense>
      <NavigateBackButton />
      <LayoutSectionHeader className='sticky top-0 z-10'>
        <DisciplineSwitcher
          disciplines={DISCIPLINES}
          initialDiscipline={discipline}
        />
      </LayoutSectionHeader>

      <Suspense
        key={discipline}
        fallback={
          <SingleResultListShell>
            {Array.from({ length: 20 }).map((_, idx) => (
              <SingleResultSkeleton key={idx} />
            ))}
          </SingleResultListShell>
        }
      >
        <PageContent discipline={discipline} />
      </Suspense>
    </>
  )
}

async function PageTitle({ type }: { type: LeaderboardType }) {
  const session = await auth()
  let title = ''
  if (session) {
    title = `${session.user.name}, check out our best ${LEADERBOARDshared_MAP[type]}`
  } else {
    title = `Check out our best ${LEADERBOARDshared_MAP[type]}`
  }
  return (
    <>
      <LayoutPageTitleMobile>{title}</LayoutPageTitleMobile>
      <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
    </>
  )
}

function PageTitleFallback() {
  return (
    <>
      <LayoutPageTitleMobileFallback />
      <LayoutHeaderTitlePortalFallback />
    </>
  )
}

async function PageContent({ discipline }: { discipline: Discipline }) {
  const initialData = await api.leaderboard.bySingle({ discipline })

  return <SingleResultList initialData={initialData} discipline={discipline} />
}

const LEADERBOARDshared_MAP: Record<LeaderboardType, string> = {
  average: 'results',
  single: 'solves',
}
