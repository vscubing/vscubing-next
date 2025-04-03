import { z } from 'zod'
import { TwistySection } from './_components/twisty-section'
import { api } from '@/trpc/server'
import { tryCatchTRPC } from '@/app/_utils/try-catch'
import { notFound, redirect } from 'next/navigation'
import { DisciplineBadge, LoadingSpinner } from '@/app/_components/ui'
import { isDiscipline, DEFAULT_DISCIPLINE, type Discipline } from '@/app/_types'
import { Suspense, type ReactNode } from 'react'
import { LayoutSectionHeader } from '@/app/(main)/_layout'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { formatSolveTime } from '@/app/_utils/formatSolveTime'
import Link from 'next/link'
import { ShareSolveButton } from './_components/share-button'

type PathParams = { contestSlug: string; solveId: string }
export default async function WatchSolvePage({
  params,
  searchParams,
}: {
  params: Promise<PathParams>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { contestSlug, solveId } = await params
  const { discipline } = await searchParams
  if (!isDiscipline(discipline))
    redirect(
      `/contests/${contestSlug}/watch/${solveId}?discipline=${DEFAULT_DISCIPLINE}`,
    )

  return (
    <Suspense
      fallback={
        <PageShell
          discipline={discipline}
          contestSlug={contestSlug}
          username='...'
          timeMs={0}
          scramblePosition='...'
        >
          <div className='col-span-full flex items-center justify-center rounded-2xl bg-black-80'>
            <LoadingSpinner />
          </div>
        </PageShell>
      }
    >
      <PageContentWithShell solveId={solveId} contestSlug={contestSlug} />
    </Suspense>
  )
}

async function PageContentWithShell({ solveId, contestSlug }: PathParams) {
  const { data: solve, error } = await tryCatchTRPC(
    api.contest.getSolve({ solveId: Number(solveId) }),
  )
  if (error) {
    if (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST') notFound()
    throw error
  }

  return (
    <PageShell
      discipline={solve.discipline}
      contestSlug={contestSlug}
      username={solve.username}
      timeMs={solve.timeMs}
      scramblePosition={expandScramblePosition(solve.position)}
    >
      <TwistySection
        solution={solve.solution}
        scramble={solve.scramble}
        discipline={solve.discipline}
      />
    </PageShell>
  )
}

function PageShell({
  discipline,
  username,
  timeMs,
  scramblePosition,
  contestSlug,
  children,
}: {
  discipline: Discipline
  contestSlug: string
  scramblePosition: string
  timeMs: number
  username: string
  children: ReactNode
}) {
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <NavigateBackButton className='self-start' />
      <LayoutHeaderTitlePortal>Watch the solve replay</LayoutHeaderTitlePortal>
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <LayoutSectionHeader className='gap-4'>
          <DisciplineBadge discipline={discipline} />
          <div>
            <Link
              href={`/contests/${contestSlug}?discipline=${discipline}`}
              className='title-h2 mb-1 text-secondary-20'
            >
              Contest {contestSlug}
            </Link>
            <p className='text-large'>Scramble {scramblePosition}</p>
          </div>
        </LayoutSectionHeader>
        <div className='flex items-center justify-between rounded-2xl bg-black-80 px-4 py-2'>
          <div className='sm:min-h-14'>
            <p className='title-h3 mb-1'>{username}</p>
            <p className='text-large text-grey-20'>{formatSolveTime(timeMs)}</p>
          </div>
          <ShareSolveButton />
        </div>

        {children}
      </div>
    </section>
  )
}

function expandScramblePosition(position?: string): string {
  if (!position) {
    return ''
  }
  const result = z
    .enum(['1', '2', '3', '4', '5', 'E1', 'E2'])
    .safeParse(position)
  if (!result.success) {
    throw Error('invalid scramble position')
  }
  if (result.data === 'E1') {
    return 'Extra 1'
  }
  if (result.data === 'E2') {
    return 'Extra 2'
  }
  return position
}
