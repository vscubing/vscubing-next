'use client'

import {
  Ellipsis,
  SecondaryButton,
  ArrowRightIcon,
  UnderlineButton,
  DisciplineIcon,
} from '@/app/_components/ui'
import { SolveTimeLinkOrDnf } from '@/app/_shared/SolveTimeButton'
import { DISCIPLINES, type Discipline } from '@/app/_types'
import { cn } from '@/app/_utils/cn'
import Link from 'next/link'

type Solve = {
  timeMs: number
  isOwn: boolean
  id: number
  nickname: string
  discipline: Discipline
  contestSlug: string
}
export function BestSolves({
  className,
  solves,
}: {
  className: string
  solves?: Solve[]
}) {
  // NOTE: we might introduce `useFittingCount()` with `solves.slice` here once we have more disciplines, but for now this is fine
  const allDisplayed = true

  return (
    <section
      className={cn(
        'flex flex-col gap-6 rounded-2xl bg-black-80 px-6 py-4 sm:gap-4 sm:p-3',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <h2 className='title-h3'>Best solves ever</h2>
        <UnderlineButton
          asChild
          className={cn('whitespace-nowrap', { invisible: allDisplayed })}
          aria-hidden={allDisplayed}
        >
          <Link href='/leaderboard'>View all</Link>
        </UnderlineButton>
      </div>
      <div className='flex flex-1 flex-col gap-1'>
        <div className='flex pl-1 text-grey-40'>
          <span className='mr-3 sm:hidden'>Type</span>
          <span className='flex-1 sm:hidden'>Nickname</span>
          <span className='hidden flex-1 sm:block'>Type/Nickname</span>
          <span className='mr-4 w-24 text-center sm:mr-0'>Single time</span>
          <div aria-hidden className='invisible h-0'>
            <OpenLeaderboardButton discipline='3x3' />
          </div>
        </div>

        <ul className='flex flex-1 flex-col gap-3'>
          <li aria-hidden className='invisible fixed'>
            <SolveRowSkeleton />
          </li>
          {solves
            ? solves.map((solve, idx) => (
                <li key={solve.id}>
                  <SolveRow solve={solve} isFirstOnPage={idx === 0} />
                </li>
              ))
            : Array.from({ length: DISCIPLINES.length }).map((_, idx) => (
                <li key={idx}>
                  <SolveRowSkeleton />
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}

type SolveProps = {
  solve: Solve
  isFirstOnPage: boolean
}
function SolveRow({ solve, isFirstOnPage }: SolveProps) {
  return (
    <div
      className={cn(
        'rounded-xl before:scale-x-[0.2] md:before:scale-x-[0.1] sm:before:scale-x-[0.2]',
        solve.isOwn ? 'spinning-border-wrapper bg-secondary-80' : 'bg-grey-100',
      )}
    >
      <div
        className={cn('spinning-border flex items-center rounded-xl pl-3', {
          'bg-secondary-80': solve.isOwn,
        })}
      >
        <span className='relative mr-3 flex flex-1 items-center pr-2 after:absolute after:right-0 after:top-1/2 after:block after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60 sm:mr-0 sm:flex-col sm:items-start'>
          <DisciplineIcon className='mr-3' discipline={solve.discipline} />
          <span className='flex w-full'>
            <Ellipsis className='flex-1'>{solve.nickname}</Ellipsis>
          </span>
        </span>
        <span className='mr-4 sm:mr-0'>
          <SolveTimeLinkOrDnf
            canShowHint={isFirstOnPage}
            result={{
              timeMs: solve.timeMs,
              isDnf: false,
            }}
            solveId={solve.id}
            discipline={solve.discipline}
            contestSlug={solve.contestSlug}
          />
        </span>
        <OpenLeaderboardButton discipline={solve.discipline} />
      </div>
    </div>
  )
}

function OpenLeaderboardButton({ discipline }: { discipline: string }) {
  const ariaLabel = `leaderboard`
  const ariaDescription = `Open leaderboard for ${discipline}`
  return (
    <>
      <SecondaryButton
        asChild
        className='sm:hidden'
        aria-label={ariaLabel}
        aria-description={ariaDescription}
      >
        <Link href={`/leaderboard?discipline=${discipline}`}>leaderboard</Link>
      </SecondaryButton>
      <SecondaryButton
        size='iconLg'
        asChild
        className='hidden w-16 sm:flex sm:h-16'
        aria-label={ariaLabel}
        aria-description={ariaDescription}
      >
        <Link href={`/leaderboard?discipline=${discipline}`}>
          <ArrowRightIcon />
        </Link>
      </SecondaryButton>
    </>
  )
}

function SolveRowSkeleton() {
  return (
    <div className='animate-pulse rounded-xl bg-grey-100'>
      <div className='opacity-0'>
        <SolveRow
          isFirstOnPage={false}
          solve={{
            contestSlug: '',
            discipline: '2by2',
            id: -1,
            isOwn: false,
            nickname: '',
            timeMs: 0,
          }}
        />
      </div>
    </div>
  )
}
