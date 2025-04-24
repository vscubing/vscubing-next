import {
  castDiscipline,
  castLeaderboardType,
  isDiscipline,
  isLeaderboardType,
  type Discipline,
  type LeaderboardType,
} from '@/types'
import { api } from '@/trpc/server'
import { DisciplineSwitcher } from '@/frontend/shared/discipline-switcher'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import {
  LayoutPageTitleMobile,
  LayoutPageTitleMobileFallback,
} from '@/app/(app)/_layout/layout-page-title-mobile'
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
import { LeaderboardTypeSwitcher } from '@/frontend/shared/leaderboard-type-switcher'
import {
  AverageList,
  AverageListShell,
  AverageResultSkeleton,
} from './_components/average-list'
import { ExclamationCircleIcon, HoverPopover } from '@/frontend/ui'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from '@/frontend/ui/tooltip'

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

  return (
    <>
      <Suspense fallback={<PageTitleFallback />}>
        <PageTitle type={type} />
      </Suspense>
      <NavigateBackButton />
      <LayoutSectionHeader className='sticky top-0 z-10 flex gap-10 md:gap-4'>
        <DisciplineSwitcher
          disciplines={DISCIPLINES}
          initialDiscipline={discipline}
        />

        <div className='flex flex-1 items-center gap-4 md:hidden'>
          <ExclamationCircleIcon className='shrink-0' />
          <p className='vertical-alignment-fix'>
            The leaderboards are updated every time an ongoing contest ends.
          </p>
        </div>

        <HoverPopover
          content='The leaderboards are updated every time an ongoing contest ends.'
          contentProps={{
            className: 'border-b border-secondary-20 whitespace-normal',
          }}
        >
          <span className='hidden md:block'>
            <ExclamationCircleIcon />
          </span>
        </HoverPopover>

        <LeaderboardTypeSwitcher initialType={type} className='ml-auto' />
      </LayoutSectionHeader>

      {type === 'single' && (
        <Suspense
          key={JSON.stringify({ discipline, type })}
          fallback={
            <SingleResultListShell>
              <div className='space-y-2'>
                {Array.from({ length: 20 }).map((_, idx) => (
                  <SingleResultSkeleton key={idx} />
                ))}
              </div>
            </SingleResultListShell>
          }
        >
          <PageContentSingle discipline={discipline} />
        </Suspense>
      )}

      {type === 'average' && (
        <Suspense
          key={JSON.stringify({ discipline, type })}
          fallback={
            <AverageListShell>
              <div className='space-y-2'>
                {Array.from({ length: 20 }).map((_, idx) => (
                  <AverageResultSkeleton key={idx} />
                ))}
              </div>
            </AverageListShell>
          }
        >
          <PageContentAverage discipline={discipline} />
        </Suspense>
      )}
    </>
  )
}

async function PageTitle({ type }: { type: LeaderboardType }) {
  const session = await auth()
  let title = ''
  if (session) {
    title = `${session.user.name}, check out our ${LEADERBOARD_TITLE_MAP[type]}`
  } else {
    title = `Check out our ${LEADERBOARD_TITLE_MAP[type]}`
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

async function PageContentSingle({ discipline }: { discipline: Discipline }) {
  const initialData = await api.leaderboard.bySingle({ discipline })

  return <SingleResultList initialData={initialData} discipline={discipline} />
}

async function PageContentAverage({ discipline }: { discipline: Discipline }) {
  const initialData = await api.leaderboard.byAverage({ discipline })

  return <AverageList initialData={initialData} discipline={discipline} />
}

const LEADERBOARD_TITLE_MAP: Record<LeaderboardType, string> = {
  average: 'best averages',
  single: 'best singles',
}
