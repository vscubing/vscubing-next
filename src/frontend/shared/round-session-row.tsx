'use client'

import { PlaceLabel } from '@/frontend/shared/place-label'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/frontend/shared/solve-time-button'
import {
  ArrowRightIcon,
  DisciplineIcon,
  MinusIcon,
  PlusIcon,
  PrimaryButton,
  SecondaryButton,
  UnderlineButton,
} from '@/frontend/ui'
import { SpinningBorder } from '@/frontend/ui/spinning-border'
import { cn } from '@/frontend/utils/cn'
import { tailwindConfig } from '@/frontend/utils/tailwind'
import { getExtraNumber, type Discipline, type RoundSession } from '@/types'
import * as Accordion from '@radix-ui/react-accordion'
import Link from 'next/link'
import type { RefObject } from 'react'
import { UserBadges } from './user-badges'
import { useSolveForm } from './use-solve-form'

// HACK: we can't just use useMatchesScreen for switching between Desktop and Tablet because then it won't be SSRed properly
type RoundSessionRowProps = {
  session: RoundSession
  discipline: Discipline
  withContestLink?: boolean
  isFirstOnPage: boolean
  place: number
  className?: string
  podiumColors?: boolean
  onPlaceClick?: () => void
}
export function RoundSessionRow({
  discipline,
  withContestLink = false,
  isFirstOnPage,
  place,
  session,
  ref,
  className,
  podiumColors = false,
  onPlaceClick,
}: RoundSessionRowProps & { ref?: RefObject<HTMLLIElement | null> }) {
  return (
    <li ref={ref} className={className}>
      <RoundSessionRowDesktop
        className='md:hidden'
        discipline={discipline}
        isFirstOnPage={isFirstOnPage}
        withContestLink={withContestLink}
        podiumColors={podiumColors}
        place={place}
        session={session}
        onPlaceClick={onPlaceClick}
      />
      <RoundSessionRowTablet
        className='hidden md:block'
        discipline={discipline}
        isFirstOnPage={isFirstOnPage}
        withContestLink={withContestLink}
        podiumColors={podiumColors}
        place={place}
        session={session}
        onPlaceClick={onPlaceClick}
      />
    </li>
  )
}

export function RoundSessionRowSkeleton() {
  return (
    <div className='h-16 animate-pulse rounded-xl bg-grey-100 md:h-[5.25rem] sm:h-[7.25rem]'></div>
  )
}

export function RoundSessionHeader({
  withContestLink = false,
}: {
  withContestLink?: boolean
}) {
  return (
    <div className='flex whitespace-nowrap pl-2 text-grey-40 md:hidden'>
      <span className='mr-2 w-11 text-center'>Place</span>
      <span className='mr-2'>Type</span>
      <span className='flex-1'>Nickname</span>
      <span className='mr-4 w-24 text-center lg:w-20'>Average time</span>
      <span className='mr-2 flex gap-2 lg:gap-1'>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className='w-24 text-center lg:w-20'>
            Attempt {index + 1}
          </span>
        ))}
      </span>

      {withContestLink && <div className='w-[9.25rem] lg:w-28' />}
    </div>
  )
}

function RoundSessionRowTablet({
  session: { solves, user, session, contestSlug },
  withContestLink,
  place,
  discipline,
  podiumColors,
  isFirstOnPage,
  className,
  onPlaceClick,
}: RoundSessionRowProps) {
  const { bestId, worstId } = getBestAndWorstIds(solves)

  return (
    <Accordion.Root type='single' collapsible asChild>
      <Accordion.Item value='result' asChild>
        <div className={className}>
          <SpinningBorder
            enabled={session.isOwn}
            color={tailwindConfig.theme.colors.secondary[60]}
            className='rounded-xl'
          >
            <div
              className={cn(
                'flex min-h-[5.25rem] flex-wrap items-center rounded-xl px-4 py-3 sm:min-h-[7.25rem] sm:p-4',
                session.isOwn ? 'bg-secondary-80' : 'bg-grey-100',
              )}
            >
              <Accordion.Header className='flex w-full flex-1 items-center sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[repeat(2,min-content)] sm:gap-x-3 sm:gap-y-1'>
                <PlaceLabel
                  onClick={onPlaceClick}
                  podiumColors={podiumColors}
                  className={cn('mr-3 sm:mr-0', {
                    'cursor-pointer': onPlaceClick,
                  })}
                >
                  {place}
                </PlaceLabel>
                <DisciplineIcon
                  className='mr-3 sm:mr-0'
                  discipline={discipline}
                />
                <span className='vertical-alignment-fix flex flex-1 items-center gap-2 sm:col-span-2 sm:w-auto'>
                  <span>{user.name}</span>
                  <UserBadges user={user} />
                </span>
                <span className='mr-10 sm:mr-0 sm:flex sm:items-center'>
                  <span className='sm:vertical-alignment-fix block text-center text-grey-40'>
                    Average time
                  </span>
                  <SolveTimeLabel
                    timeMs={session.result?.timeMs ?? undefined}
                    isDnf={session.result?.isDnf}
                    isAverage={session.isFinished}
                    isPlaceholder={!session.isFinished}
                  />
                </span>
                <Accordion.Trigger className='outline-ring group sm:py-2'>
                  <PlusIcon className='block group-data-[state=open]:hidden' />
                  <MinusIcon className='hidden group-data-[state=open]:block' />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className='w-full overflow-y-clip data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                <ul className='grid grid-flow-col grid-cols-[repeat(5,min-content)] grid-rows-[min-content_min-content] justify-end gap-x-2 gap-y-1 border-t border-grey-60 pt-4 sm:grid-flow-row sm:grid-cols-2 sm:grid-rows-none sm:items-center sm:gap-y-0 sm:pl-2 sm:pt-3'>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <li key={solves[idx]?.id ?? idx} className='contents'>
                      <span className='text-center text-grey-40 sm:text-left'>
                        Attempt {idx + 1}
                      </span>
                      <span className='relative flex items-center sm:ml-auto sm:text-right'>
                        <SingleAttempt
                          contestSlug={contestSlug}
                          session={session}
                          isFirstOnPage={isFirstOnPage}
                          idx={idx}
                          solves={solves}
                          discipline={discipline}
                          bestId={bestId}
                          worstId={worstId}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
                {withContestLink && (
                  <SecondaryButton
                    asChild
                    size='sm'
                    className='mt-4 h-11 w-full gap-1'
                  >
                    <Link
                      href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${session.id}`}
                    >
                      <span>Contest {contestSlug}</span>
                      <ArrowRightIcon className='inline-block' />
                    </Link>
                  </SecondaryButton>
                )}
              </Accordion.Content>
            </div>
          </SpinningBorder>
        </div>
      </Accordion.Item>
    </Accordion.Root>
  )
}

function RoundSessionRowDesktop({
  session: { solves, user, session, contestSlug },
  place,
  withContestLink,
  isFirstOnPage,
  discipline,
  podiumColors,
  className,
  onPlaceClick,
}: RoundSessionRowProps) {
  const { bestId, worstId } = getBestAndWorstIds(solves)

  return (
    <div className={className}>
      <SpinningBorder
        color={tailwindConfig.theme.colors.secondary[60]}
        enabled={session.isOwn}
        className='rounded-xl'
      >
        <div
          className={cn(
            'flex h-16 w-full items-center rounded-xl pl-2',
            session.isOwn ? 'bg-secondary-80' : 'bg-grey-100',
          )}
        >
          <PlaceLabel
            onClick={onPlaceClick}
            podiumColors={podiumColors}
            className={cn('mr-3', { 'cursor-pointer': onPlaceClick })}
          >
            {place}
          </PlaceLabel>
          <DisciplineIcon className='mr-3' discipline={discipline} />
          <span className='vertical-alignment-fix flex min-w-0 flex-1 items-center gap-2 overflow-x-clip text-ellipsis text-nowrap'>
            <span>{user.name}</span>
            <UserBadges user={user} />
          </span>

          <SolveTimeLabel
            timeMs={session.result?.timeMs ?? undefined}
            isDnf={session.result?.isDnf}
            isAverage={session.isFinished}
            isPlaceholder={!session.isFinished}
            className='relative mr-4 after:absolute after:-right-2 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60'
          />

          <ul className='mr-2 grid grid-cols-[repeat(5,min-content)] gap-x-2 lg:gap-x-1'>
            {Array.from({ length: 5 }).map((_, idx) => (
              <li key={solves[idx]?.id ?? idx} className='contents'>
                <span className='sr-only'>Attempt {idx + 1}</span>
                <span className='relative flex items-center'>
                  <SingleAttempt
                    contestSlug={contestSlug}
                    session={session}
                    isFirstOnPage={isFirstOnPage}
                    idx={idx}
                    discipline={discipline}
                    solves={solves}
                    bestId={bestId}
                    worstId={worstId}
                  />
                </span>
              </li>
            ))}
          </ul>
          {withContestLink && (
            <SecondaryButton
              asChild
              size='lg'
              className='w-[9.25rem] justify-between px-[1.3rem] lg:w-28'
            >
              <Link
                href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${session.id}`}
              >
                <span>Contest {contestSlug}</span>
                <ArrowRightIcon className='inline-block lg:hidden' />
              </Link>
            </SecondaryButton>
          )}
        </div>
      </SpinningBorder>
    </div>
  )
}

function getBestAndWorstIds(solves: RoundSessionRowProps['session']['solves']) {
  const dnfSolve = solves.find(({ result: { isDnf } }) => isDnf)
  const successful = solves
    .filter(({ result: { timeMs, isDnf } }) => timeMs !== null && !isDnf)
    .sort((a, b) => a.result.timeMs! - b.result.timeMs!)
  const bestId = successful.at(0)?.id
  const worstId = dnfSolve?.id ?? successful.at(-1)?.id

  return { bestId, worstId }
}

function SingleAttempt({
  solves,
  session,
  idx,
  isFirstOnPage,
  worstId,
  bestId,
  discipline,
  contestSlug,
}: {
  solves: RoundSession['solves']
  idx: number
  session: RoundSession['session']
  isFirstOnPage: boolean
  contestSlug: string
  discipline: Discipline
  bestId?: number
  worstId?: number
}) {
  const isInProgress =
    solves[idx]?.status === 'pending' ||
    (solves.at(-1)?.status !== 'pending' && idx === solves.length)
  debugger
  if (session.isOwn && isInProgress) {
    return (
      <OwnSolveInProgress
        contestSlug={contestSlug}
        discipline={discipline}
        bestId={bestId}
        worstId={worstId}
      />
    )
  }

  const solve = solves[idx]
  if (!solve) {
    return <SolveTimeLabel isPlaceholder />
  }
  return (
    <SolveTimeLinkOrDnf
      canShowHint={isFirstOnPage && idx === 0}
      contestSlug={contestSlug}
      solveId={solve.id}
      discipline={discipline}
      result={solve.result}
      isFestive={solve.isPersonalRecord}
      variant={
        solve.id === bestId
          ? 'best'
          : solve.id === worstId
            ? 'worst'
            : undefined
      }
      extraNumber={getExtraNumber(solve.position)}
      backgroundColorClass={session.isOwn ? 'bg-secondary-80' : 'bg-grey-100'}
    />
  )
}

function OwnSolveInProgress({
  contestSlug,
  discipline,
  worstId,
  bestId,
}: {
  contestSlug: string
  discipline: Discipline
  bestId?: number
  worstId?: number
}) {
  const { state, isPending, handleSubmitSolve, handleInitSolve } = useSolveForm(
    { contestSlug, discipline },
  )

  if (!state.currentSolve)
    return (
      <span className='inline-flex h-full w-24 items-center justify-center lg:w-20'>
        <PrimaryButton size='sm' autoFocus onClick={handleInitSolve}>
          Solve
        </PrimaryButton>
      </span>
    )

  return (
    <div className='relative'>
      <SolveTimeLinkOrDnf
        result={state.currentSolve.result}
        contestSlug={contestSlug}
        discipline={discipline}
        solveId={state.currentSolve.id}
        canShowHint={false}
        backgroundColorClass='bg-secondary-80'
        extraNumber={getExtraNumber(state.currentScramble.position)}
        variant={
          state.currentSolve.id === bestId
            ? 'best'
            : state.currentSolve.id === worstId
              ? 'worst'
              : undefined
        }
      />
      <div className='absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-2'>
        {state.canChangeToExtra && (
          <UnderlineButton
            size='sm'
            disabled={isPending}
            onClick={() =>
              handleSubmitSolve({
                type: 'changed_to_extra',
                reason: 'not implemented yet',
              })
            }
            className='h-5 text-red-80 hover:text-red-100 active:text-red-80'
          >
            Extra
          </UnderlineButton>
        )}
        <UnderlineButton
          size='sm'
          disabled={isPending}
          onClick={() => handleSubmitSolve({ type: 'submitted' })}
          className='h-5'
          autoFocus
        >
          Submit
        </UnderlineButton>
      </div>
    </div>
  )
}
