import { DisciplineIcon, Ellipsis, PlusIcon, MinusIcon } from '@/frontend/ui'
import { cn } from '@/frontend/utils/cn'
import * as Accordion from '@radix-ui/react-accordion'
import { ExtraLabel } from '@/frontend/shared/extra-label'
import { PlaceLabel } from '@/frontend/shared/place-label'
import {
  SolveTimeLabel,
  SolveTimeLinkOrDnf,
} from '@/frontend/shared/solve-time-button'
import type { Discipline, ContestResultRoundSession } from '@/types'
import { SpinningBorder } from '@/frontend/ui/spinning-border'
import { tailwindConfig, useMatchesScreen } from '@/frontend/utils/tailwind'
import type { RefObject } from 'react'

type SessionProps = {
  session: ContestResultRoundSession
  contestSlug: string
  discipline: Discipline
  isFirstOnPage: boolean
  place: number
  className?: string
  ref?: RefObject<HTMLLIElement | null>
  onPlaceClick?: () => void
}
export function Session({
  contestSlug,
  discipline,
  isFirstOnPage,
  place,
  session,
  ref,
  className,
  onPlaceClick,
}: SessionProps) {
  const isTablet = useMatchesScreen('md')

  return (
    <>
      <SessionDesktop
        className={cn('md:hidden', className)}
        contestSlug={contestSlug}
        discipline={discipline}
        isFirstOnPage={isFirstOnPage}
        place={place}
        session={session}
        ref={isTablet === false ? ref : undefined}
        onPlaceClick={onPlaceClick}
      />
      <SessionTablet
        className={cn('hidden md:block', className)}
        contestSlug={contestSlug}
        discipline={discipline}
        isFirstOnPage={isFirstOnPage}
        place={place}
        session={session}
        ref={isTablet === true ? ref : undefined}
        onPlaceClick={onPlaceClick}
      />
    </>
  )
}

function SessionTablet({
  session: { solves, nickname, isOwn, avgMs },
  place,
  contestSlug,
  discipline,
  isFirstOnPage,
  className,
  ref,
  onPlaceClick,
}: SessionProps & { className: string }) {
  const currentUserLabel = isOwn ? ' (you)' : ''

  const { bestId, worstId } = getBestAndWorstIds(solves)

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
                'flex min-h-[5.1rem] flex-wrap items-center rounded-xl px-4 py-3 sm:min-h-28 sm:p-4',
                isOwn ? 'bg-secondary-80' : 'bg-grey-100',
              )}
            >
              <Accordion.Header className='flex w-full flex-1 items-center sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[repeat(2,min-content)] sm:gap-x-3 sm:gap-y-1'>
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
                          discipline={discipline}
                          result={solve.result}
                          isFestive={solve.isPersonalBest}
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
            </div>
          </SpinningBorder>
        </li>
      </Accordion.Item>
    </Accordion.Root>
  )
}

function SessionDesktop({
  session: { solves, nickname, isOwn, avgMs },
  place,
  isFirstOnPage,
  contestSlug,
  discipline,
  className,
  ref,
  onPlaceClick,
}: SessionProps & { className: string }) {
  const currentUserLabel = isOwn ? ' (you)' : ''

  const { bestId, worstId } = getBestAndWorstIds(solves)

  return (
    <li className={className} ref={ref}>
      <SpinningBorder
        color={tailwindConfig.theme.colors.secondary[60]}
        enabled={isOwn}
        className='rounded-xl'
      >
        <div
          className={cn(
            'flex h-15 w-full items-center rounded-xl px-2',
            isOwn ? 'bg-secondary-80' : 'bg-grey-100',
          )}
        >
          <div className='flex flex-1 items-center'>
            <PlaceLabel
              onClick={onPlaceClick}
              className={cn('mr-3', { 'cursor-pointer': onPlaceClick })}
            >
              {place}
            </PlaceLabel>
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
                      discipline={discipline}
                      solveId={solve.id}
                      result={solve.result}
                      isFestive={solve.isPersonalBest}
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
                      className={cn('absolute -top-2 right-[1.1rem] z-10', {
                        'text-white-100 [text-shadow:_1px_1px_2px_black]':
                          solve.isPersonalBest,
                      })}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SpinningBorder>
    </li>
  )
}

export function SessionSkeleton() {
  return (
    <div className='h-15 animate-pulse rounded-xl bg-grey-100 md:h-[5.1rem] sm:h-28'></div>
  )
}

function getBestAndWorstIds(solves: SessionProps['session']['solves']) {
  const dnfSolve = solves.find(({ result: { isDnf } }) => isDnf)
  const successful = solves
    .filter(({ result: { timeMs, isDnf } }) => timeMs !== null && !isDnf)
    .sort((a, b) => a.result.timeMs! - b.result.timeMs!)
  const bestId = successful.at(0)?.id
  const worstId = dnfSolve?.id ?? successful.at(-1)?.id

  return { bestId, worstId }
}
