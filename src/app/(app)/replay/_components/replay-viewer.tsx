'use client'

import { TwistySection } from '@/app/(app)/contests/[contestSlug]/watch/[solveId]/_components/twisty-section'
import { DisciplineBadge, HoverPopover } from '@/frontend/ui'
import { SpinningBorder } from '@/frontend/ui/spinning-border'
import { cn } from '@/frontend/utils/cn'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { LayoutSectionHeader } from '@/app/(app)/_layout'
import { SolveTimeLabel } from '@/frontend/shared/solve-time-link-or-dnf'
import { ShareSolveButton } from '@/app/(app)/contests/[contestSlug]/watch/[solveId]/_components/share-button'
import tailwindConfig from 'tailwind.config'
import { Alg } from '@vscubing/cubing/alg'
import { isRotation } from '@/lib/utils/is-rotation'
import { removeSolutionComments } from '@/lib/utils/remove-solution-comments'
import type { Discipline } from '@/types'
import type { ReactNode } from 'react'
import Link from 'next/link'

export type ReplayData = {
  discipline: Discipline
  scramble: string
  solution: string
  timeMs: number | null
  isDnf: boolean
  username?: string
  date?: number

  // Contest-specific fields (optional)
  contestSlug?: string
  roundSessionId?: number
  scramblePosition?: string
  isOwn?: boolean
  isPersonalRecord?: boolean
}

export function ReplayViewer({ data }: { data: ReplayData }) {
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <NavigateBackButton className='self-start' />
      <LayoutHeaderTitlePortal>Watch the solve replay</LayoutHeaderTitlePortal>
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <ReplayHeader data={data} />
        <ReplayUserCard data={data} />
        <TwistySection
          solution={data.solution}
          scramble={data.scramble}
          discipline={data.discipline}
        />
      </div>
    </section>
  )
}

export function ReplayLoadingShell({
  discipline,
  contestSlug,
  scramblePosition,
  children,
}: {
  discipline: Discipline
  contestSlug: string
  scramblePosition: string
  children: ReactNode
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
              href={`/contests/${contestSlug}/results?discipline=${discipline}`}
              className='title-h2 mb-1 text-secondary-20'
            >
              Contest {contestSlug}
            </Link>
            <p className='text-base'>Scramble {scramblePosition}</p>
          </div>
        </LayoutSectionHeader>
        <div className='flex h-full items-center justify-between rounded-2xl bg-black-80 px-4 py-2'>
          <div className='sm:min-h-14'>
            <p className='title-h3 mb-1'>...</p>
            <p className='text-base text-grey-20'>...</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

function ReplayHeader({ data }: { data: ReplayData }) {
  const { discipline, contestSlug, scramblePosition, date } = data

  if (contestSlug) {
    return (
      <LayoutSectionHeader className='gap-4'>
        <a href={`/leaderboard?discipline=${discipline}?type=single`}>
          <DisciplineBadge discipline={discipline} />
        </a>
        <div>
          <a
            href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${data.roundSessionId}`}
            className='title-h2 mb-1 text-secondary-20'
          >
            Contest {contestSlug}
          </a>
          <p className='text-base'>Scramble {scramblePosition}</p>
        </div>
      </LayoutSectionHeader>
    )
  }

  return (
    <LayoutSectionHeader className='gap-4'>
      <DisciplineBadge discipline={discipline} />
      <div>
        <p className='title-h2 mb-1 text-secondary-20'>Dojo Practice</p>
        {date && (
          <p className='text-base'>
            {new Date(date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </LayoutSectionHeader>
  )
}

function ReplayUserCard({ data }: { data: ReplayData }) {
  const { username, timeMs, isOwn, isPersonalRecord, solution, isDnf } = data

  return (
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
          <p className='title-h3 mb-1'>{username ?? 'Anonymous'}</p>
          <p className='text-base text-grey-20'>
            {isDnf ? (
              <span className='mr-4'>DNF</span>
            ) : (
              <SolveTimeLabel
                timeMs={timeMs ?? 0}
                className='mr-4 min-w-0 lg:min-w-0'
                isFestive={isPersonalRecord}
              />
            )}
            <span className='text-grey-40'>
              <SolveTps solution={solution} timeMs={timeMs} />
            </span>
          </p>
        </div>
        <ShareSolveButton />
      </div>
    </SpinningBorder>
  )
}

function SolveTps({
  solution,
  timeMs,
}: {
  solution?: string
  timeMs?: number | null
}) {
  if (!timeMs || !solution) return null

  const timeSeconds = timeMs / 1000
  const turnCount = Array.from(
    new Alg(removeSolutionComments(solution)).childAlgNodes(),
  ).filter((node) => !isRotation(node)).length
  const tps = (turnCount / timeSeconds).toFixed(1)

  return (
    <span>
      {turnCount} turns, {tps} TPS{' '}
      <HoverPopover content={<div className='p-3'>Turns per second</div>}>
        (?)
      </HoverPopover>
    </span>
  )
}
