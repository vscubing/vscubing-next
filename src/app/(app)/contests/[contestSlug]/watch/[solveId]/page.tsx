import { z } from 'zod'
import { TwistySection } from './_components/twisty-section'
import { api } from '@/trpc/server'
import { tryCatchTRPC } from '@/utils/try-catch'
import { notFound } from 'next/navigation'
import { DisciplineBadge, HoverPopover, LoadingSpinner } from '@/frontend/ui'
import { type Discipline, castDiscipline } from '@/types'
import { Suspense, type ReactNode } from 'react'
import { LayoutSectionHeader } from '@/app/(app)/_layout'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import Link from 'next/link'
import { ShareSolveButton } from './_components/share-button'
import { SpinningBorder } from '@/frontend/ui/spinning-border'
import tailwindConfig from 'tailwind.config'
import { cn } from '@/frontend/utils/cn'
import { Alg } from '@vscubing/cubing/alg'
import { isRotation } from '@/utils/is-rotation'
import { removeSolutionComments } from '@/utils/remove-solution-comments'
import { SolveTimeLabel } from '@/frontend/shared/solve-time-button'

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

  return (
    <Suspense
      fallback={
        <PageShell
          discipline={castDiscipline(discipline)}
          contestSlug={contestSlug}
          username='...'
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
      roundSessionId={solve.roundSessionId}
      contestSlug={contestSlug}
      username={solve.user.name}
      timeMs={solve.timeMs}
      scramblePosition={expandScramblePosition(solve.position)}
      isOwn={solve.isOwn}
      isPersonalBest={solve.isPersonalBest}
      solution={solve.solution}
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
  roundSessionId,
  isOwn,
  solution,
  children,
  isPersonalBest,
}: {
  discipline: Discipline
  contestSlug: string
  roundSessionId?: number
  scramblePosition: string
  timeMs?: number
  solution?: string
  username: string
  children: ReactNode
  isOwn?: boolean
  isPersonalBest?: boolean
}) {
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <NavigateBackButton className='self-start' />
      <LayoutHeaderTitlePortal>Watch the solve replay</LayoutHeaderTitlePortal>
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <LayoutSectionHeader className='gap-4'>
          <Link href={`/leaderboard?discipline=${discipline}?type=single`}>
            <DisciplineBadge discipline={discipline} />
          </Link>
          <div>
            <Link
              href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${roundSessionId}`}
              className='title-h2 mb-1 text-secondary-20'
            >
              Contest {contestSlug}
            </Link>
            <p className='text-large'>Scramble {scramblePosition}</p>
          </div>
        </LayoutSectionHeader>
        <SpinningBorder
          color={tailwindConfig.theme.colors.secondary[60]}
          enabled={isOwn ?? false}
          className='rounded-2xl'
        >
          <div
            className={cn(
              'flex h-full items-center justify-between rounded-2xl px-4 py-2',
              isOwn ? 'bg-secondary-80' : 'bg-black-80',
            )}
          >
            <div className='sm:min-h-14'>
              <p className='title-h3 mb-1'>{username}</p>
              <p className='text-large text-grey-20'>
                <SolveTimeLabel
                  timeMs={timeMs ?? 0}
                  className='mr-4 min-w-0 lg:min-w-0'
                  isFestive={isPersonalBest}
                ></SolveTimeLabel>
                <span className='text-grey-40'>
                  <SolveTps solution={solution} timeMs={timeMs} />
                </span>
              </p>
            </div>
            <ShareSolveButton />
          </div>
        </SpinningBorder>

        {children}
      </div>
    </section>
  )
}

function SolveTps({
  solution,
  timeMs,
}: {
  solution?: string
  timeMs?: number
}) {
  if (!timeMs || !solution) return

  const timeSeconds = timeMs / 1000
  const turnCount = Array.from(
    new Alg(removeSolutionComments(solution)).childAlgNodes(),
  ).filter((node) => !isRotation(node)).length
  const tps = (turnCount / timeSeconds).toFixed(1)

  return (
    <span>
      {turnCount} turns, {tps} TPS {''}
      <HoverPopover
        content='Turns per second'
        contentProps={{ className: 'border-b-2 border-primary-100' }}
      >
        (?)
      </HoverPopover>
    </span>
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
