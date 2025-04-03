import { LayoutSectionHeader } from '@/app/(main)/_layout/index'
import { DisciplineBadge, LoadingSpinner } from '@/app/_components/ui'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { formatSolveTime } from '@/app/_utils/formatSolveTime'
import Link from 'next/link'
import { z } from 'zod'
import { ShareSolveButton } from './_components/share-button'
import { TwistySection } from './_components/twisty-section'
import { api } from '@/trpc/server'
import { tryCatchTRPC } from '@/app/_utils/try-catch'
import { notFound } from 'next/navigation'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { Suspense } from 'react'

export default async function WatchSolvePage({
  params,
}: {
  params: Promise<{ contestSlug: string; solveId: string }>
}) {
  const { contestSlug, solveId } = await params
  const { data: solve, error } = await tryCatchTRPC(
    api.contest.getSolve({ solveId: Number(solveId) }),
  )
  if (error) {
    if (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST') notFound()
    throw error
  }
  // await new Promise((res) => setTimeout(res, 2000))

  return (
    <section className='flex flex-1 flex-col gap-3'>
      <NavigateBackButton className='self-start' />
      <LayoutHeaderTitlePortal>Watch the solve replay</LayoutHeaderTitlePortal>
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <LayoutSectionHeader className='gap-4'>
          <DisciplineBadge discipline={solve.discipline} />
          <div>
            <Link
              href={`/contests/${contestSlug}?discipline=${solve.discipline}`}
              className='title-h2 mb-1 text-secondary-20'
            >
              Contest {contestSlug}
            </Link>
            <p className='text-large'>
              Scramble {expandScramblePosition(solve.position)}
            </p>
          </div>
        </LayoutSectionHeader>
        <div className='flex items-center justify-between rounded-2xl bg-black-80 px-4 py-2'>
          <div className='sm:min-h-14'>
            <p className='title-h3 mb-1'>{solve.username}</p>
            <p className='text-large text-grey-20'>
              {formatSolveTime(solve.timeMs)}
            </p>
          </div>
          <ShareSolveButton />
        </div>

        <TwistySection
          solution={solve.solution}
          scramble={solve.scramble}
          discipline={solve.discipline}
        />
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
