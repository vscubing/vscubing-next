'use client'

import {
  DisciplineIcon,
  Ellipsis,
  PlusIcon,
  MinusIcon,
} from '@/app/_components/ui'
import { cn } from '@/app/_utils/cn'
import { useMemo } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ExtraLabel } from '@/app/_shared/ExtraLabel'
import { PlaceLabel } from '@/app/_shared/PlaceLabel'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/app/_shared/SolveTimeButton'
import type { Discipline, ContestResultRoundSession } from '@/app/_types'

type SessionProps = ContestResultRoundSession & {
  contestSlug: string
  discipline: Discipline
  isFirstOnPage: boolean
  place: number
}
export function Session(props: SessionProps) {
  return (
    <>
      <SessionDesktop className='md:hidden' {...props} />
      <SessionTablet className='hidden md:block' {...props} />
    </>
  )
}

function SessionTablet({
  solves,
  place,
  nickname,
  isOwn,
  avgMs,
  contestSlug,
  discipline,
  isFirstOnPage,
  className,
}: SessionProps & { className: string }) {
  const currentUserLabel = isOwn ? ' (you)' : ''

  const { bestId, worstId } = useMemo(
    () => getBestAndWorstIds(solves),
    [solves],
  )
  return (
    <Accordion.Root type='single' collapsible className={className}>
      <Accordion.Item
        value='result'
        className={cn(
          'flex min-h-[4.5rem] flex-wrap items-center rounded-xl px-4 py-2 sm:min-h-28 sm:p-4',
          isOwn ? 'bg-secondary-80' : 'bg-grey-100',
        )}
      >
        <Accordion.Header className='flex w-full flex-1 items-center sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[repeat(2,min-content)] sm:gap-x-3 sm:gap-y-1'>
          <PlaceLabel className='mr-3 sm:mr-0'>{place}</PlaceLabel>
          <DisciplineIcon className='mr-3 sm:mr-0' discipline={discipline} />
          <Ellipsis className='vertical-alignment-fix flex-1 sm:col-span-2 sm:w-auto'>{`${nickname}${currentUserLabel}`}</Ellipsis>

          <span className='mr-10 sm:mr-0 sm:flex sm:items-center'>
            <span className='sm:vertical-alignment-fix block text-center text-grey-40'>
              Average time
            </span>
            <SolveTimeLabel
              timeMs={avgMs ?? undefined}
              isDnf={avgMs === null}
              isAverage
            />
          </span>
          <Accordion.Trigger className='outline-ring group sm:py-2'>
            <PlusIcon className='block group-data-[state=open]:hidden' />
            <MinusIcon className='hidden group-data-[state=open]:block' />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className='w-full overflow-y-clip data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
          <ul className='grid grid-flow-col grid-cols-[repeat(5,min-content)] grid-rows-2 justify-end gap-x-2 border-t border-grey-60 pt-4 sm:grid-flow-row sm:grid-cols-2 sm:grid-rows-none sm:items-center sm:pl-2 sm:pt-3'>
            {solves.map((solve, index) => (
              <li key={solve.id} className='contents'>
                <span className='text-center text-grey-40 sm:text-left'>
                  Attempt {index + 1}
                </span>
                <span className='relative sm:ml-auto sm:text-right'>
                  <SolveTimeLinkOrDnf
                    canShowHint={isFirstOnPage && index === 0}
                    contestSlug={contestSlug}
                    solveId={solve.id}
                    result={solve.result}
                    variant={
                      solve.id === bestId
                        ? 'best'
                        : solve.id === worstId
                          ? 'worst'
                          : undefined
                    }
                  />

                  <ExtraLabel
                    scramblePosition={solve.position}
                    className='absolute -top-2 right-[1.1rem] sm:-top-1'
                  />
                </span>
              </li>
            ))}
          </ul>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}

function SessionDesktop({
  solves,
  place,
  nickname,
  isOwn,
  avgMs,
  contestSlug,
  discipline,
  isFirstOnPage,
  className,
}: SessionProps & { className: string }) {
  const currentUserLabel = isOwn ? ' (you)' : ''

  const { bestId, worstId } = useMemo(
    () => getBestAndWorstIds(solves),
    [solves],
  )
  return (
    <div
      className={cn(
        'flex h-15 items-center rounded-xl px-2',
        isOwn ? 'bg-secondary-80' : 'bg-grey-100',
        className,
      )}
    >
      <div className='flex flex-1 items-center'>
        <PlaceLabel className='mr-3'>{place}</PlaceLabel>
        <DisciplineIcon className='mr-3' discipline={discipline} />
        <Ellipsis className='vertical-alignment-fix flex-1'>{`${nickname}${currentUserLabel}`}</Ellipsis>

        <span className='mr-4'>
          <SolveTimeLabel
            timeMs={avgMs ?? undefined}
            isDnf={avgMs === null}
            isAverage
            className='relative after:absolute after:-right-2 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60'
          />
        </span>
      </div>
      <div className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
        <ul className='grid grid-cols-[repeat(5,min-content)] gap-x-2'>
          {solves.map((solve, index) => (
            <li key={solve.id} className='contents'>
              <span className='hidden text-center text-grey-40'>
                Attempt {index + 1}
              </span>
              <span className='relative'>
                <SolveTimeLinkOrDnf
                  canShowHint={isFirstOnPage && index === 0}
                  contestSlug={contestSlug}
                  solveId={solve.id}
                  result={solve.result}
                  variant={
                    solve.id === bestId
                      ? 'best'
                      : solve.id === worstId
                        ? 'worst'
                        : undefined
                  }
                />

                <ExtraLabel
                  scramblePosition={solve.position}
                  className='absolute -top-2 right-[1.1rem]'
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function SessionSkeleton() {
  return (
    <div className='h-15 animate-pulse rounded-xl bg-grey-100 md:h-[4.5rem] sm:h-28'></div>
  )
}

function getBestAndWorstIds(solves: SessionProps['solves']) {
  const dnfSolve = solves.find(({ result: { isDnf } }) => isDnf)
  const successful = solves
    .filter(({ result: { timeMs, isDnf } }) => timeMs !== null && !isDnf)
    .sort((a, b) => a.result.timeMs! - b.result.timeMs!)
  const bestId = successful.at(0)?.id
  const worstId = dnfSolve?.id ?? successful.at(-1)?.id

  return { bestId, worstId }
}
