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
import { useMatchesScreen } from '@/app/_utils/tailwind'
import type { Discipline, RoundSession } from '@/app/_types'

type SessionProps = RoundSession & {
  contestSlug: string
  discipline: Discipline
  isFirstOnPage: boolean
  place: number
}
export function Session({
  solves,
  place,
  nickname,
  isOwn,
  avgMs,
  contestSlug,
  discipline,
  isFirstOnPage,
}: SessionProps) {
  const currentUserLabel = isOwn ? ' (you)' : ''

  const isMdScreen = useMatchesScreen('md')
  const { bestId, worstId } = useMemo(
    () => getBestAndWorstIds(solves),
    [solves],
  )
  return (
    <Accordion.Root
      type='single'
      collapsible
      defaultValue={isMdScreen ? undefined : 'result'}
    >
      <Accordion.Item
        value='result'
        className={cn(
          'flex min-h-15 items-center rounded-xl px-2 md:min-h-[4.5rem] md:flex-wrap md:px-4 md:py-2 sm:min-h-28 sm:p-4',
          isOwn ? 'bg-secondary-80' : 'bg-grey-100',
        )}
      >
        <Accordion.Header className='flex flex-1 items-center md:w-full sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[repeat(2,min-content)] sm:gap-x-3 sm:gap-y-1'>
          <PlaceLabel className='mr-3 sm:mr-0'>{place}</PlaceLabel>
          <DisciplineIcon className='mr-3 sm:mr-0' discipline={discipline} />
          <Ellipsis className='vertical-alignment-fix flex-1 sm:col-span-2 sm:w-auto'>{`${nickname}${currentUserLabel}`}</Ellipsis>

          <span className='mr-4 md:mr-10 sm:mr-0 sm:flex sm:items-center'>
            <span className='sm:vertical-alignment-fix hidden text-center text-grey-40 md:block'>
              Average time
            </span>
            <SolveTimeLabel
              timeMs={avgMs ?? undefined}
              isDnf={avgMs === null}
              isAverage
              className='relative after:absolute after:-right-2 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-grey-60 md:after:hidden'
            />
          </span>
          <Accordion.Trigger className='outline-ring group hidden md:block sm:py-2'>
            <PlusIcon className='block group-data-[state=open]:hidden' />
            <MinusIcon className='hidden group-data-[state=open]:block' />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down md:w-full md:overflow-y-clip'>
          <ul className='grid grid-cols-[repeat(5,min-content)] gap-x-2 md:grid-flow-col md:grid-rows-2 md:justify-end md:border-t md:border-grey-60 md:pt-4 sm:grid-flow-row sm:grid-cols-2 sm:grid-rows-none sm:items-center sm:pl-2 sm:pt-3'>
            {solves.map((solve, index) => (
              <li key={solve.id} className='contents'>
                <span className='hidden text-center text-grey-40 md:block sm:text-left'>
                  Attempt {index + 1}
                </span>
                <span className='relative sm:ml-auto sm:text-right'>
                  <SolveTimeLinkOrDnf
                    canShowHint={isFirstOnPage && index === 0}
                    contestSlug={contestSlug}
                    discipline={discipline}
                    solveId={solve.id}
                    timeMs={solve.timeMs}
                    isDnf={solve.isDnf}
                    variant={
                      solve.id === bestId
                        ? 'best'
                        : solve.id === worstId
                          ? 'worst'
                          : undefined
                    }
                  />

                  <ExtraLabel
                    scramblePosition={solve.scramblePosition}
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

export function SessionSkeleton() {
  return (
    <div className='h-15 animate-pulse rounded-xl bg-grey-100 md:h-[4.5rem] sm:h-28'></div>
  )
}

function getBestAndWorstIds(solves: SessionProps['solves']) {
  const dnfSolve = solves.find(({ isDnf }) => isDnf)
  const successful = solves
    .filter(({ timeMs, isDnf }) => timeMs !== null && !isDnf)
    .sort((a, b) => a.timeMs! - b.timeMs!)
  const bestId = successful.at(0)?.id
  const worstId = dnfSolve?.id ?? successful.at(-1)?.id

  return { bestId, worstId }
}
