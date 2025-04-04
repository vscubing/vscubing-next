import {
  castDiscipline,
  castLeaderboardType,
  isDiscipline,
  isLeaderboardType,
  type Discipline,
  type LeaderboardType,
} from '@/app/_types'
import { api } from '@/trpc/server'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { PageTitleMobile } from '@/app/_shared/PageTitleMobile'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { redirect } from 'next/navigation'
import { DISCIPLINES } from '@/shared'
import { SingleResultList } from './_components/single-result-list'
import { LayoutSectionHeader } from '@/app/(main)/_layout'
import { Suspense } from 'react'
import { auth } from '@/server/auth'
import {
  SingleResultListShell,
  SingleResultSkeleton,
} from './_components/single-result'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { discipline, type } = await searchParams
  if (!isDiscipline(discipline) || !isLeaderboardType(type))
    redirect(
      `/leaderboard?discipline=${castDiscipline(discipline)}&type=${castLeaderboardType(type)}`,
    )

  const session = await auth()
  let title = ''
  if (session) {
    title = `${session.user.name}, check out our best ${LEADERBOARD_TYPE_MAP[type]}`
  } else {
    title = `Check out our best ${LEADERBOARD_TYPE_MAP[type]}`
  }

  return (
    <>
      <PageTitleMobile>{title}</PageTitleMobile>
      <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
      <NavigateBackButton />
      <LayoutSectionHeader>
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
              <li key={idx}>
                <SingleResultSkeleton />
              </li>
            ))}
          </SingleResultListShell>
        }
      >
        <PageContent discipline={discipline} />
      </Suspense>
    </>
  )
}

async function PageContent({ discipline }: { discipline: Discipline }) {
  const initialData = await api.leaderboard.bySingle({ discipline })

  return <SingleResultList initialData={initialData} discipline={discipline} />
}

const LEADERBOARD_TYPE_MAP: Record<LeaderboardType, string> = {
  average: 'results',
  single: 'solves',
}
