'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { ChevronUpIcon } from '@/frontend/ui'
import { SolveTimeLinkOrDnf } from '@/frontend/shared/solve-time-link-or-dnf'
import {
  getExtraNumber,
  type ScramblePosition,
  type Discipline,
  type ResultDnfable,
} from '@/types'
import { cn } from '@/frontend/utils/cn'

type SubmittedSolve = {
  id: number
  result: ResultDnfable
  isPersonalRecord: boolean
  scramble: {
    position: ScramblePosition
  }
}

export function OwnAttemptsPopover({
  submittedSolves,
  contestSlug,
  discipline,
}: {
  submittedSolves: SubmittedSolve[]
  contestSlug: string
  discipline: Discipline
}) {
  if (submittedSolves.length === 0) return null

  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            className='flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-80'
            aria-label='View submitted attempts'
          >
            <ChevronUpIcon className='text-white h-6 w-6' />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side='top'
            align='end'
            sideOffset={8}
            className={cn(
              'z-50 -mr-2 mb-2 rounded-xl bg-secondary-80 p-4 shadow-lg',
              'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            )}
          >
            <ul className='flex flex-col gap-1'>
              {submittedSolves.map((solve, index) => {
                const extraNumber = getExtraNumber(solve.scramble.position)
                return (
                  <li key={index} className='flex items-center'>
                    <span className='vertical-alignment-fix w-20 text-center text-[.875rem] text-grey-40'>
                      Attempt {index + 1}
                    </span>
                    <span className='relative flex-1 text-right'>
                      <SolveTimeLinkOrDnf
                        result={solve.result}
                        solveId={solve.id}
                        contestSlug={contestSlug}
                        discipline={discipline}
                        canShowHint={false}
                        isFestive={solve.isPersonalRecord}
                        extraNumber={extraNumber ?? undefined}
                        backgroundColorClass='bg-secondary-80'
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
