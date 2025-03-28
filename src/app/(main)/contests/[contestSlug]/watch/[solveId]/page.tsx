import { Header, SectionHeader } from '@/app/_components/layout'
import { LoadingSpinner, DisciplineBadge, toast } from '@/app/_components/ui'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { copyToClipboard } from '@/app/_utils/copyToClipboard'
import { formatSolveTime } from '@/app/_utils/formatSolveTime'
import { db } from '@/server/db'
import {
  roundSessionTable,
  scrambleTable,
  solveTable,
  usersTable,
} from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Suspense } from 'react'
import { z } from 'zod'
import TwistySection from './twisty-section.lazy'

export default async function Page({
  params,
}: {
  params: Promise<{ contestSlug: string; solveId: string }>
}) {
  const { contestSlug, solveId } = await params
  const solve = (
    await db
      .select()
      .from(solveTable)
      .where(eq(solveTable.id, Number(solveId)))
      .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
      .innerJoin(
        roundSessionTable,
        eq(roundSessionTable.id, solveTable.roundSessionId),
      )
      .innerJoin(usersTable, eq(usersTable.id, roundSessionTable.contestantId))
  )[0]!

  // solve.
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <Header title='Watch the solution' />

      <NavigateBackButton className='self-start' />
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <SectionHeader className='gap-4'>
          <DisciplineBadge discipline='3by3' />
          <div>
            <Link
              href='/'
              // to='/contests/$contestSlug'
              // search={{ discipline: search.discipline }}
              // params={{ contestSlug: params.contestSlug }}
              className='title-h2 mb-1 text-secondary-20'
            >
              Contest {contestSlug}
            </Link>
            <p className='text-large'>
              Scramble {expandScramblePosition(solve.scramble.position)}
            </p>
          </div>
        </SectionHeader>
        <div className='flex items-center justify-between rounded-2xl bg-black-80 px-4 py-2'>
          <div className='sm:min-h-14'>
            <p className='title-h3 mb-1'>{solve.user.name}</p>
            <p className='text-large text-grey-20'>
              {solve.solve.timeMs ? formatSolveTime(solve.solve.timeMs) : null}
            </p>
          </div>
          {/* <SecondaryButton size='iconSm' onClick={copyWatchSolveLink}> */}
          {/*   <ShareIcon /> */}
          {/* </SecondaryButton> */}
        </div>

        <Suspense
          fallback={
            <div className='col-span-full flex items-center justify-center rounded-2xl bg-black-80'>
              <LoadingSpinner />
            </div>
          }
        >
          <TwistySection
            solution={solve.solve.reconstruction!}
            scramble={solve.scramble.moves!}
            discipline={'3by3'}
          />
        </Suspense>
      </div>
    </section>
  )
}

function copyWatchSolveLink() {
  copyToClipboard(window.location.href).then(
    () =>
      toast({
        title: 'Link copied',
        description: 'You can now share the link with your friends.',
        duration: 'short',
      }),
    () =>
      toast({
        title: 'Uh-oh! An error occured while copying the link',
        description: 'Try changing permissions in your browser settings.',
      }),
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
