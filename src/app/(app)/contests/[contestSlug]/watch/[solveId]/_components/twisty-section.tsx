'use client'

import {
  TwistyScrubber,
  TwistyCube,
  TwistyAlgViewer,
  TwistyControls,
  TwistyTempo,
  useTwistyPlayer,
} from '@/frontend/shared/twisty'
import { type ReactNode, useLayoutEffect, useRef } from 'react'
import {
  type ExperimentalLeafIndex,
  type TwistyPlayer as Player,
} from '@vscubing/cubing/twisty'
import { MinusIcon, PlusIcon } from '@/frontend/ui'
import * as Accordion from '@radix-ui/react-accordion'
import { cn } from '@/frontend/utils/cn'
import type { Discipline } from '@/types'
import { useMatchesScreen } from '@/frontend/utils/tailwind'

export function TwistySection({
  scramble,
  solution,
  discipline,
}: {
  solution: string
  scramble: string
  discipline: Discipline
}) {
  const { player, startIndex } = useTwistyPlayer({
    solution,
    scramble,
    discipline,
  })
  if (!player) return null

  return (
    <TwistySectionContent
      startIndex={startIndex}
      player={player}
      scramble={scramble}
    />
  )
}

function TwistySectionContent({
  player,
  startIndex,
  scramble,
}: {
  player: Player
  startIndex: ExperimentalLeafIndex
  scramble: string
}) {
  const movesWrapperRef = useRef<HTMLDivElement | null>(null)
  const scrambleWrapperRef = useRef<HTMLDivElement | null>(null)
  const scrambleRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(
    function handleScrambleScrollableHeight() {
      if (
        !scrambleWrapperRef.current ||
        !scrambleRef.current ||
        !movesWrapperRef.current
      ) {
        return
      }
      const wrapperHeight = movesWrapperRef.current.clientHeight
      const scrambleHeight = scrambleRef.current.offsetHeight
      scrambleWrapperRef.current.style.flexBasis =
        Math.min(wrapperHeight / 4, scrambleHeight) + 'px'
    },
    [scrambleWrapperRef, scrambleRef, movesWrapperRef],
  )

  const isSmScreen = useMatchesScreen('sm')

  return (
    <>
      <div className='bg-black-80 flex flex-col gap-10 rounded-2xl pb-6 md:col-span-full lg:gap-6'>
        <div className='flex max-h-[35rem] flex-1 sm:max-w-full sm:overflow-x-clip md:min-h-[20rem]'>
          <TwistyCube player={player} className='h-full flex-1 sm:-mx-5' />
        </div>
        <div className='flex w-[27rem] max-w-full flex-col items-center gap-2 self-center sm:px-3'>
          <TwistyScrubber player={player} className='w-full px-4' />
          <TwistyControls player={player} className='w-full' />
        </div>
      </div>
      <div className='flex flex-col gap-3 md:col-span-full md:flex-col-reverse'>
        <Accordion.Root
          className='flex flex-1 flex-col gap-3 sm:flex sm:flex-col-reverse md:grid md:grid-cols-2'
          ref={movesWrapperRef}
          type='multiple'
          defaultValue={isSmScreen ? [] : ['Scramble', 'Solve']}
        >
          <AccordionItem title='Scramble'>
            <div className='border-grey-60 flex flex-col border-t pt-2'>
              <div className='scrollbar basis-0 pr-2' ref={scrambleWrapperRef}>
                <span ref={scrambleRef}>{scramble}</span>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem title='Solve' className='flex-1'>
            <div className='border-grey-60 flex h-full flex-col border-t pt-2'>
              <div className='scrollbar -mt-1 -ml-1 flex-grow basis-0 overflow-y-auto pt-1 pr-2 pl-1 md:overflow-y-visible'>
                <TwistyAlgViewer
                  twistyPlayer={player}
                  startIndex={startIndex}
                />
              </div>
            </div>
          </AccordionItem>
        </Accordion.Root>

        <div className='bg-black-80 rounded-2xl p-4 md:flex md:justify-center'>
          <div className='md:w-[25rem] md:max-w-full'>
            <h2 className='title-h3 text-grey-20 mb-1'>Speed</h2>
            <TwistyTempo twistyPlayer={player} />
          </div>
        </div>
      </div>
    </>
  )
}

type AccordionItemProps = {
  title: string
  className?: string
  children: ReactNode
}
function AccordionItem({ title, className, children }: AccordionItemProps) {
  return (
    <Accordion.Item
      className={cn('bg-black-80 flex flex-col rounded-2xl p-4', className)}
      value={title}
    >
      <Accordion.Header className='flex justify-between'>
        <div className='title-h3 text-grey-20'>{title}</div>
        <Accordion.Trigger className='outline-ring group hidden sm:block'>
          <PlusIcon className='block group-data-[state=open]:hidden' />
          <MinusIcon className='hidden group-data-[state=open]:block' />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className='title-h3 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down flex-1 overflow-y-clip pt-2 tracking-wide'>
        {children}
      </Accordion.Content>
    </Accordion.Item>
  )
}
