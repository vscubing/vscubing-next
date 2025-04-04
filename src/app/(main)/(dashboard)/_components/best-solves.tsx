'use client'

import { Ellipsis, SecondaryButton, ArrowRightIcon } from '@/app/_components/ui'
import { SolveTimeLinkOrDnf } from '@/app/_shared/SolveTimeButton'
import type { Discipline } from '@/app/_types'
import { CubeIcon } from '@/app/landing/_shared/icons'
import Link from 'next/link'

type BestSolvesProps = {
  className: string
  solves?: any
}
export function BestSolves({ className, solves }: BestSolvesProps) {
  // const { fittingCount, containerRef, fakeElementRef } = useFittingCount()
  // let countToDisplay = fittingCount
  // if (solves && matchesQuery('md')) {
  //   countToDisplay = solves.length
  // }
  //
  // let allDisplayed = undefined
  // if (!!countToDisplay && solves?.length) {
  //   allDisplayed = solves.length <= countToDisplay
  // }
  //
  // return (
  //   <section
  //     className={cn(
  //       'flex flex-col gap-6 rounded-2xl bg-black-80 px-6 py-4 sm:gap-4 sm:p-3',
  //       className,
  //     )}
  //   >
  //     <div className='flex items-center justify-between'>
  //       <h2 className='title-h3'>Best solves ever</h2>
  //       <UnderlineButton
  //         asChild
  //         className={cn('whitespace-nowrap', { invisible: allDisplayed })}
  //         aria-hidden={allDisplayed}
  //       >
  //         <Link to='/leaderboard'>View all</Link>
  //       </UnderlineButton>
  //     </div>
  //     <div className='flex flex-1 flex-col gap-1'>
  //       <div className='flex pl-1 text-grey-40'>
  //         <span className='mr-3 sm:hidden'>Type</span>
  //         <span className='flex-1 sm:hidden'>Nickname</span>
  //         <span className='hidden flex-1 sm:block'>Type/Nickname</span>
  //         <span className='mr-4 w-24 text-center sm:mr-0'>Single time</span>
  //         <div aria-hidden className='invisible h-0'>
  //           <OpenLeaderboardButton discipline='3x3' />
  //         </div>
  //       </div>
  //       <ListWrapper
  //         className='gap-3'
  //         fakeElementRef={fakeElementRef}
  //         containerRef={containerRef}
  //         renderFakeElement={SolveSkeleton}
  //       >
  //         <List
  //           getItemKey={(solve) => solve.id}
  //           pageSize={countToDisplay}
  //           renderItem={({ item: solve, isFirst }) => (
  //             <Solve isFirstOnPage={isFirst} solve={solve} />
  //           )}
  //           renderSkeleton={SolveSkeleton}
  //           list={solves?.slice(0, countToDisplay)}
  //         />
  //       </ListWrapper>
  //     </div>
  //   </section>
  // )
}

function SolveSkeleton() {
  return <div className='h-15 animate-pulse rounded-xl bg-grey-100'></div>
}

type SolveProps = {
  solve: ContestsSolveListBestInEveryDiscipline
  isFirstOnPage: boolean
}
function Solve({ solve, isFirstOnPage }: SolveProps) {
  return (
    <div className='flex min-h-15 items-center rounded-xl bg-grey-100 pl-3'>
      <span className='relative mr-3 flex flex-1 items-center pr-2 after:absolute after:right-0 after:top-1/2 after:block after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60 sm:mr-0 sm:flex-col sm:items-start'>
        <CubeIcon className='mr-3' cube={solve.discipline.slug as Discipline} />
        <span className='flex w-full'>
          <Ellipsis className='flex-1'>{solve.user.username}</Ellipsis>
        </span>
      </span>
      <span className='mr-4 sm:mr-0'>
        <SolveTimeLinkOrDnf
          canShowHint={isFirstOnPage}
          timeMs={solve.timeMs}
          isDnf={false}
          solveId={solve.id}
          discipline={solve.discipline.slug as Discipline}
          contestSlug={solve.contest.slug}
        />
      </span>
      <OpenLeaderboardButton discipline={solve.discipline.slug} />
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
        <Link
          to='/leaderboard/$discipline'
          search={{ page: 1 }}
          params={{ discipline: discipline }}
        >
          leaderboard
        </Link>
      </SecondaryButton>
      <SecondaryButton
        size='iconLg'
        asChild
        className='hidden w-16 sm:flex sm:h-16'
        aria-label={ariaLabel}
        aria-description={ariaDescription}
      >
        <Link
          to='/leaderboard/$discipline'
          params={{ discipline: discipline }}
          search={{ page: 1 }}
        >
          <ArrowRightIcon />
        </Link>
      </SecondaryButton>
    </>
  )
}
