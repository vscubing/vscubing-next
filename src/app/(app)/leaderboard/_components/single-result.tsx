'use client'

import {
  Ellipsis,
  PlusIcon,
  MinusIcon,
  SecondaryButton,
  DisciplineIcon,
  ArrowRightIcon,
} from '@/frontend/ui'
import { SpinningBorder } from '@/frontend/ui/spinning-border'
import { PlaceLabel } from '@/frontend/shared/place-label'
import { SolveTimeLinkOrDnf } from '@/frontend/shared/solve-time-button'
import type { Discipline } from '@/types'
import { cn } from '@/frontend/utils/cn'
import { formatDate } from '@/utils/format-date'
import { useMatchesScreen } from '@/frontend/utils/tailwind'
import type { RouterOutputs } from '@/trpc/react'
import * as Accordion from '@radix-ui/react-accordion'
import Link from 'next/link'
import { type ReactNode, type RefObject } from 'react'
import tailwindConfig from 'tailwind.config'

// HACK: we need castom handling for refs because you can't set one ref to 2 elements at the same time
// HACK: we can't just use useMatchesScreen for switching between Desktop and Tablet because then it won't be SSRed properly
type SingleResultProps = {
  result: RouterOutputs['leaderboard']['bySingle'][number]
  discipline: Discipline
  place: number
  className?: string
  onPlaceClick?: () => void
  ref?: RefObject<HTMLLIElement | null>
}
export function SingleResult({
  className,
  discipline,
  place,
  result,
  ref,
  onPlaceClick,
}: SingleResultProps) {
  const isTablet = useMatchesScreen('md')

  return (
    <>
      <SingleResultDesktop
        className={cn('md:hidden', className)}
        discipline={discipline}
        place={place}
        result={result}
        onPlaceClick={onPlaceClick}
        ref={isTablet === false ? ref : undefined}
      />
      <SingleResultTablet
        className={cn('hidden md:block', className)}
        discipline={discipline}
        place={place}
        result={result}
        ref={isTablet === true ? ref : undefined}
        onPlaceClick={onPlaceClick}
      />
    </>
  )
}

function SingleResultDesktop({
  result: { result, id, createdAt, contestSlug, nickname, isOwn },
  discipline,
  place,
  className,
  ref,
  onPlaceClick,
}: SingleResultProps & { className: string }) {
  let displayedNickname = nickname
  if (isOwn) {
    displayedNickname = displayedNickname + ' (you)'
  }

  return (
    <li className={className} ref={ref}>
      <SpinningBorder
        color={tailwindConfig.theme.colors.secondary[60]}
        enabled={isOwn}
        className='rounded-xl'
      >
        <div
          className={cn(
            'flex min-h-16 items-center rounded-xl pl-2',
            isOwn ? 'bg-secondary-80' : 'bg-grey-100',
          )}
        >
          <PlaceLabel
            onClick={onPlaceClick}
            className={cn('mr-3', { 'cursor-pointer': onPlaceClick })}
          >
            {place}
          </PlaceLabel>
          <DisciplineIcon className='mr-3' discipline={discipline} />
          <Ellipsis className='vertical-alignment-fix flex-1'>
            {displayedNickname}
          </Ellipsis>
          <SolveTimeLinkOrDnf
            className='mr-6'
            canShowHint={place === 1}
            result={result}
            solveId={id}
            contestSlug={contestSlug}
            discipline={discipline}
          />

          <span className='vertical-alignment-fix w-36 border-l border-grey-60 text-center'>
            {formatDate(createdAt)}
          </span>
          <SecondaryButton
            asChild
            size='lg'
            className='w-[9.25rem] justify-between px-[1.3rem]'
          >
            <Link
              href={`/contests/${contestSlug}/results?discipline=${discipline}`}
            >
              <span>Contest {contestSlug}</span>
              <ArrowRightIcon className='inline-block' />
            </Link>
          </SecondaryButton>
        </div>
      </SpinningBorder>
    </li>
  )
}

function SingleResultTablet({
  result: { result, id, createdAt, contestSlug, nickname, isOwn },
  discipline,
  place,
  className,
  ref,
  onPlaceClick,
}: SingleResultProps & { className: string }) {
  let displayedNickname = nickname
  if (isOwn) {
    displayedNickname = displayedNickname + ' (you)'
  }

  return (
    <Accordion.Root type='single' collapsible asChild>
      <Accordion.Item value='result' asChild>
        <li className={className} ref={ref}>
          <SpinningBorder
            enabled={isOwn}
            color={tailwindConfig.theme.colors.secondary[60]}
            className='rounded-xl'
          >
            <div
              className={cn(
                'min-h-[5.25rem] flex-wrap items-center rounded-xl px-4 py-3 sm:min-h-[7.25rem] sm:p-4',
                isOwn ? 'bg-secondary-80' : 'bg-grey-100',
              )}
            >
              <Accordion.Header className='flex w-full flex-1 items-center sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[min-content_min-content] sm:gap-x-3 sm:gap-y-1'>
                <PlaceLabel
                  onClick={onPlaceClick}
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
                <Ellipsis className='vertical-alignment-fix flex-1 sm:col-span-2 sm:w-auto'>
                  {displayedNickname}
                </Ellipsis>
                <span className='mr-10 sm:mr-0 sm:flex sm:items-center'>
                  <span className='sm:vertical-alignment-fix mb-1 block text-center text-grey-40 sm:mb-0'>
                    Single time
                  </span>
                  <SolveTimeLinkOrDnf
                    canShowHint={place === 1}
                    result={result}
                    solveId={id}
                    contestSlug={contestSlug}
                    discipline={discipline}
                  />
                </span>
                <Accordion.Trigger className='outline-ring group sm:py-2'>
                  <PlusIcon className='block group-data-[state=open]:hidden' />
                  <MinusIcon className='hidden group-data-[state=open]:block' />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className='w-full overflow-y-clip data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down sm:mt-3'>
                <span className='flex items-center justify-between border-t border-grey-60 pt-4'>
                  <span className='vertical-alignment-fix min-w-24 border-l border-none border-grey-60 pt-0 text-center sm:min-w-0'>
                    <span className='mb-2 block text-center text-grey-40'>
                      Solve date
                    </span>
                    {formatDate(createdAt)}
                  </span>
                  <SecondaryButton
                    asChild
                    size='sm'
                    className='h-[3.25rem] w-[9.25rem] justify-between px-[1.3rem] sm:h-11'
                  >
                    <Link
                      href={`/contests/${contestSlug}/results?discipline=${discipline}`}
                    >
                      <span>Contest {contestSlug}</span>
                      <ArrowRightIcon className='inline-block' />
                    </Link>
                  </SecondaryButton>
                </span>
              </Accordion.Content>
            </div>
          </SpinningBorder>
        </li>
      </Accordion.Item>
    </Accordion.Root>
  )
}

export function SingleResultSkeleton() {
  return (
    <li className='h-16 animate-pulse rounded-xl bg-grey-100 md:h-[5.25rem] sm:h-[7.25rem]'></li>
  )
}

export function SingleResultListShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 sm:p-3'>
      <div className='flex whitespace-nowrap pl-2 text-grey-40 md:hidden'>
        <span className='mr-2 w-11 text-center'>Place</span>
        <span className='mr-2'>Type</span>
        <span className='flex-1'>Nickname</span>
        <span className='mr-6 w-24 text-center'>Single time</span>
        <span className='w-36 text-center'>Solve date</span>
        <SecondaryButton
          aria-hidden
          className='invisible h-px w-[9.25rem]'
        ></SecondaryButton>
      </div>

      <ul className='flex flex-1 flex-col gap-2'>{children}</ul>
    </div>
  )
}
