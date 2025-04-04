import {
  Ellipsis,
  PlusIcon,
  MinusIcon,
  SecondaryButton,
  DisciplineIcon,
  ArrowRightIcon,
} from '@/app/_components/ui'
import { PlaceLabel } from '@/app/_shared/PlaceLabel'
import { SolveTimeLinkOrDnf } from '@/app/_shared/SolveTimeButton'
import type { Discipline } from '@/app/_types'
import { cn } from '@/app/_utils/cn'
import { formatDate } from '@/app/_utils/formatDate'
import type { RouterOutputs } from '@/trpc/react'
import * as Accordion from '@radix-ui/react-accordion'
import Link from 'next/link'
import type { ReactNode } from 'react'

type SingleResultProps = RouterOutputs['leaderboard']['bySingle'][number] & {
  discipline: Discipline
  place: number
}
export function SingleResult(props: SingleResultProps) {
  return (
    <>
      <SingleResultDesktop className='md:hidden' {...props} />
      <SingleResultTablet className='hidden md:block' {...props} />
    </>
  )
}

function SingleResultDesktop({
  timeMs,
  id,
  createdAt,
  contestSlug,
  nickname,
  isOwn,
  discipline,
  place,
  className,
}: SingleResultProps & { className: string }) {
  let displayedNickname = nickname
  if (isOwn) {
    displayedNickname = displayedNickname + ' (you)'
  }

  return (
    <li
      className={cn(
        'flex min-h-15 items-center rounded-xl pl-2',
        isOwn ? 'bg-secondary-80' : 'bg-grey-100',
        className,
      )}
    >
      <div className='flex flex-1 items-center'>
        <PlaceLabel className='mr-3'>{place}</PlaceLabel>
        <DisciplineIcon className='mr-3' discipline={discipline} />
        <Ellipsis className='vertical-alignment-fix flex-1'>
          {displayedNickname}
        </Ellipsis>
        <span className='mr-6'>
          <span className='sm:vertical-alignment-fix mb-1 hidden text-center text-grey-40'>
            Single time
          </span>
          <SolveTimeLinkOrDnf
            canShowHint={place === 1}
            result={{ isDnf: false, timeMs }}
            solveId={id}
            contestSlug={contestSlug}
            discipline={discipline}
          />
        </span>
      </div>
      <div className='overflow-y-clip data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
        <span className='flex items-center'>
          <span className='vertical-alignment-fix w-36 border-l border-grey-60 text-center'>
            <span className='mb-2 hidden text-center text-grey-40'>
              Solve date
            </span>
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
        </span>
      </div>
    </li>
  )
}

function SingleResultTablet({
  timeMs,
  id,
  createdAt,
  contestSlug,
  nickname,
  isOwn,
  discipline,
  place,
  className,
}: SingleResultProps & { className: string }) {
  let displayedNickname = nickname
  if (isOwn) {
    displayedNickname = displayedNickname + ' (you)'
  }

  return (
    <Accordion.Root type='single' collapsible className={className}>
      <Accordion.Item
        value='result'
        className={cn(
          'flex min-h-[4.75rem] flex-wrap items-center rounded-xl px-4 pb-2 pt-3 sm:min-h-28 sm:p-4',
          isOwn ? 'bg-secondary-80' : 'bg-grey-100',
        )}
      >
        <Accordion.Header className='flex w-full flex-1 items-center sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[min-content_min-content] sm:gap-x-3 sm:gap-y-1'>
          <PlaceLabel className='mr-3 sm:mr-0'>{place}</PlaceLabel>
          <DisciplineIcon className='mr-3 sm:mr-0' discipline={discipline} />
          <Ellipsis className='vertical-alignment-fix flex-1 sm:col-span-2 sm:w-auto'>
            {displayedNickname}
          </Ellipsis>
          <span className='mr-10 sm:mr-0 sm:flex sm:items-center'>
            <span className='sm:vertical-alignment-fix mb-1 block text-center text-grey-40 sm:mb-0'>
              Single time
            </span>
            <SolveTimeLinkOrDnf
              canShowHint={place === 1}
              result={{ isDnf: false, timeMs }}
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
      </Accordion.Item>
    </Accordion.Root>
  )
}

export function SingleResultSkeleton() {
  return (
    <div className='h-15 animate-pulse rounded-xl bg-grey-100 md:h-[4.75rem] sm:h-28'></div>
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
