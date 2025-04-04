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

type ResultProps = RouterOutputs['leaderboard']['bySingle'][number] & {
  discipline: Discipline
  place: number
}
export function SingleResult({
  timeMs,
  id,
  createdAt,
  contestSlug,
  nickname,
  isOwn,
  discipline,
  place,
}: ResultProps) {
  let displayedNickname = nickname
  if (isOwn) {
    displayedNickname = displayedNickname + ' (you)'
  }

  return (
    <Accordion.Root
      type='single'
      collapsible
      value='result'
      // value={matchesQuery('md') ? undefined : 'result'}
    >
      <Accordion.Item
        value='result'
        className={cn(
          'flex min-h-15 items-center rounded-xl pl-2 md:min-h-[4.75rem] md:flex-wrap md:px-4 md:py-2 sm:min-h-28 sm:p-4',
          isOwn ? 'bg-secondary-80' : 'bg-grey-100',
        )}
      >
        <Accordion.Header className='flex flex-1 items-center md:w-full sm:mb-3 sm:grid sm:grid-flow-col sm:grid-cols-[min-content_1fr_min-content] sm:grid-rows-[min-content_min-content] sm:gap-x-3 sm:gap-y-1'>
          <PlaceLabel className='mr-3 sm:mr-0'>{place}</PlaceLabel>
          <DisciplineIcon className='mr-3 sm:mr-0' discipline={discipline} />
          <Ellipsis className='vertical-alignment-fix flex-1 sm:col-span-2 sm:w-auto'>
            {displayedNickname}
          </Ellipsis>
          <span className='mr-6 md:mr-10 sm:mr-0 sm:flex sm:items-center'>
            <span className='sm:vertical-alignment-fix mb-1 hidden text-center text-grey-40 md:block sm:mb-0'>
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
          <Accordion.Trigger className='outline-ring group hidden md:block sm:py-2'>
            <PlusIcon className='block group-data-[state=open]:hidden' />
            <MinusIcon className='hidden group-data-[state=open]:block' />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className='overflow-y-clip data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down md:w-full'>
          <span className='flex items-center md:justify-between md:border-t md:border-grey-60 md:pt-4'>
            <span className='vertical-alignment-fix w-36 border-l border-grey-60 text-center md:w-auto md:min-w-24 md:border-none md:pt-0 sm:min-w-0'>
              <span className='mb-2 hidden text-center text-grey-40 md:block'>
                Solve date
              </span>
              {formatDate(createdAt)}
            </span>
            <SecondaryButton
              asChild
              // size={matchesQuery('sm') ? 'sm' : 'lg'}
              size='lg'
              className='w-[9.25rem] justify-between px-[1.3rem] md:h-[3.25rem] sm:h-11'
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
