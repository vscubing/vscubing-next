'use client'

import {
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
import type { RouterOutputs } from '@/trpc/react'
import * as Accordion from '@radix-ui/react-accordion'
import Link from 'next/link'
import { type ReactNode } from 'react'
import tailwindConfig from 'tailwind.config'
import { UserBadges } from '@/frontend/shared/user-badges'

// HACK: we can't just use useMatchesScreen for switching between Desktop and Tablet because then it won't be SSRed properly
type SingleResultProps = {
  result: RouterOutputs['leaderboard']['bySingle'][number]
  discipline: Discipline
  place: number
  onPlaceClick?: () => void
  className?: string
}
export function SingleResult({
  className,
  discipline,
  place,
  result,
  onPlaceClick,
}: SingleResultProps) {
  return (
    <li className={className}>
      <SingleResultDesktop
        className='md:hidden'
        discipline={discipline}
        place={place}
        result={result}
        onPlaceClick={onPlaceClick}
      />
      <SingleResultTablet
        className='hidden md:block'
        discipline={discipline}
        place={place}
        result={result}
        onPlaceClick={onPlaceClick}
      />
    </li>
  )
}

function SingleResultDesktop({
  result: { result, id, createdAt, contestSlug, user, isOwn, roundSessionId },
  discipline,
  place,
  className,
  onPlaceClick,
}: SingleResultProps & { className: string }) {
  return (
    <div className={className}>
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
          <span className='vertical-alignment-fix flex flex-1 items-start gap-2'>
            <span>{user.name}</span>
            <UserBadges user={user} />
          </span>
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
              href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${roundSessionId}`}
            >
              <span>Contest {contestSlug}</span>
              <ArrowRightIcon className='inline-block' />
            </Link>
          </SecondaryButton>
        </div>
      </SpinningBorder>
    </div>
  )
}

function SingleResultTablet({
  result: { result, id, createdAt, contestSlug, user, isOwn, roundSessionId },
  discipline,
  place,
  className,
  onPlaceClick,
}: SingleResultProps & { className: string }) {
  return (
    <Accordion.Root type='single' collapsible asChild>
      <Accordion.Item value='result' asChild>
        <div className={className}>
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
                <span className='vertical-alignment-fix flex flex-1 items-start gap-2 sm:col-span-2 sm:w-auto'>
                  <span>{user.name}</span>
                  <UserBadges user={user} />
                </span>
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
                  <span className='vertical-alignment-fix w-20 border-l border-none border-grey-60 pt-0 text-center sm:min-w-0'>
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
                      href={`/contests/${contestSlug}/results?discipline=${discipline}&scrollToId=${roundSessionId}`}
                    >
                      <span>Contest {contestSlug}</span>
                      <ArrowRightIcon className='inline-block' />
                    </Link>
                  </SecondaryButton>
                </span>
              </Accordion.Content>
            </div>
          </SpinningBorder>
        </div>
      </Accordion.Item>
    </Accordion.Root>
  )
}

export function SingleResultSkeleton() {
  return (
    <div className='h-16 animate-pulse rounded-xl bg-grey-100 md:h-[5.25rem] sm:h-[7.25rem]'></div>
  )
}

export function SingleResultListShell({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col gap-1 rounded-2xl bg-black-80 p-6 lg:p-4 sm:p-3'>
      <div className='flex whitespace-nowrap pl-2 text-grey-40 md:hidden'>
        <span className='mr-2 w-11 text-center'>Place</span>
        <span className='mr-2'>Type</span>
        <span className='flex-1'>Nickname</span>
        <span className='mr-6 w-24 text-center lg:w-20'>Single time</span>
        <span className='w-36 text-center'>Solve date</span>
        <SecondaryButton
          aria-hidden
          className='invisible h-px w-[9.25rem]'
        ></SecondaryButton>
      </div>
      {children}
    </div>
  )
}
