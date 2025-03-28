import { Header, SectionHeader } from '@/app/_components/layout'
import { DisciplineBadge } from '@/app/_components/ui'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { formatSolveTime } from '@/app/_utils/formatSolveTime'
import { db } from '@/server/db'
import {
  contestsToDisciplinesTable,
  roundSessionTable,
  scrambleTable,
  solveTable,
  usersTable,
} from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { ShareSolveButton } from './share-button'
import { TwistySection } from './twisty-section.client'

export default async function Page({
  params,
}: {
  params: Promise<{ contestSlug: string; solveId: string }>
}) {
  const { contestSlug, solveId } = await params
  const solve = (
    await db
      .select({
        scramble: scrambleTable.moves,
        position: scrambleTable.position,
        solution: solveTable.reconstruction,
        username: usersTable.name,
        timeMs: solveTable.timeMs,
        discipline: contestsToDisciplinesTable.disciplineSlug,
      })
      .from(solveTable)
      .where(eq(solveTable.id, Number(solveId)))
      .innerJoin(scrambleTable, eq(scrambleTable.id, solveTable.scrambleId))
      .innerJoin(
        roundSessionTable,
        eq(roundSessionTable.id, solveTable.roundSessionId),
      )
      .innerJoin(usersTable, eq(usersTable.id, roundSessionTable.contestantId))
      .innerJoin(
        contestsToDisciplinesTable,
        eq(
          contestsToDisciplinesTable.id,
          roundSessionTable.contestDisciplineId,
        ),
      )
  )[0]

  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (!solve) notFound()
  if (!solve.solution || !solve.timeMs || !solve.scramble)
    throw new Error(
      `The solve exists, but is incomplete. \nSolution: ${solve.solution} \ntimeMs: ${solve.timeMs} \nscramble: ${solve.scramble}`,
    )

  // solve.
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <Header title='Watch the solution' />

      <NavigateBackButton className='self-start' />
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <SectionHeader className='gap-4'>
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
        </SectionHeader>
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
