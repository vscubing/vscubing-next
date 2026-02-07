'use client'

import { cn } from '@/frontend/utils/cn'
import { formatSolveTime } from '@/lib/utils/format-solve-time'
import type { ResultDnfable } from '@/types'
import {
  type DojoSolve,
  calculateMo3,
  calculateAo5,
  calculateAo12,
  findBestMo3,
  findBestAo5,
  findBestAo12,
} from './calculate-stats'
import { Trash2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/frontend/ui/popovers/alert-dialog'

type DojoSidebarProps = {
  solves: DojoSolve[]
  onDeleteSolve: (id: number) => void
  onClearSession: () => void
  className?: string
}

export function DojoSidebar({
  solves,
  onDeleteSolve,
  onClearSession,
  className,
}: DojoSidebarProps) {
  const currentMo3 = calculateMo3(solves)
  const currentAo5 = calculateAo5(solves)
  const currentAo12 = calculateAo12(solves)
  const bestMo3 = findBestMo3(solves)
  const bestAo5 = findBestAo5(solves)
  const bestAo12 = findBestAo12(solves)

  return (
    <aside
      className={cn(
        'flex w-72 flex-col gap-3 overflow-hidden rounded-2xl bg-black-80 p-4',
        className,
      )}
    >
      <div className='flex shrink-0 flex-col gap-2'>
        <h3 className='text-lg font-medium text-grey-20'>Statistics</h3>
        <div className='grid grid-cols-3 gap-2 text-sm'>
          <div />
          <div className='text-center text-grey-40'>Current</div>
          <div className='text-center text-grey-40'>Best</div>

          <div className='text-grey-40'>mo3</div>
          <StatCell result={currentMo3} />
          <StatCell result={bestMo3} isBest />

          <div className='text-grey-40'>ao5</div>
          <StatCell result={currentAo5} />
          <StatCell result={bestAo5} isBest />

          <div className='text-grey-40'>ao12</div>
          <StatCell result={currentAo12} />
          <StatCell result={bestAo12} isBest />
        </div>
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-2'>
        <div className='flex shrink-0 items-center justify-between'>
          <h3 className='text-lg font-medium text-grey-20'>Solves</h3>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-grey-40'>{solves.length} total</span>
            {solves.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className='rounded p-1 text-grey-40 transition-colors hover:bg-black-100 hover:text-red-500'
                    title='Clear all solves'
                  >
                    <Trash2Icon className='h-4 w-4' />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogPortal>
                  <AlertDialogOverlay />
                  <AlertDialogContent>
                    <AlertDialogTitle>Clear all solves?</AlertDialogTitle>
                    <p className='text-sm text-grey-40'>
                      This will delete all {solves.length} solves. This action
                      cannot be undone.
                    </p>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onClearSession} autoFocus>
                        Clear all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogPortal>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className='flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto'>
          {solves.length === 0 ? (
            <p className='text-center text-sm text-grey-40'>No solves yet</p>
          ) : (
            solves.map((solve, index) => (
              <SolveRow
                key={solve.id}
                solve={solve}
                index={solves.length - index}
                onDelete={() => onDeleteSolve(solve.id)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  )
}

function StatCell({
  result,
  isBest,
}: {
  result: ResultDnfable | null
  isBest?: boolean
}) {
  if (!result) {
    return <div className='text-center text-grey-60'>-</div>
  }

  if (result.isDnf) {
    return <div className='text-center text-grey-60'>DNF</div>
  }

  return (
    <div
      className={cn('text-center', {
        'text-primary-60': isBest,
        'text-grey-20': !isBest,
      })}
    >
      {formatSolveTime(result.timeMs, true)}
    </div>
  )
}

function SolveRow({
  solve,
  index,
  onDelete,
}: {
  solve: DojoSolve
  index: number
  onDelete: () => void
}) {
  const timeDisplay = solve.result.isDnf
    ? solve.result.timeMs
      ? `DNF (${formatSolveTime(solve.result.timeMs, true)})`
      : 'DNF'
    : formatSolveTime(solve.result.timeMs, true)

  return (
    <div className='group flex items-center justify-between rounded-lg bg-black-100 px-3 py-2'>
      <span className='text-sm text-grey-40'>#{index}</span>
      <div className='flex items-center gap-2'>
        <span
          className={cn('text-sm font-medium', {
            'text-grey-60': solve.result.isDnf,
            'text-grey-20': !solve.result.isDnf,
          })}
        >
          {timeDisplay}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className='rounded p-0.5 text-grey-60 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100'
              title='Delete solve'
            >
              <Trash2Icon className='h-3.5 w-3.5' />
            </button>
          </AlertDialogTrigger>
          <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogContent>
              <AlertDialogTitle>Delete solve #{index}?</AlertDialogTitle>
              <p className='text-sm text-grey-40'>
                Delete solve with time {timeDisplay}? This action cannot be
                undone.
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} autoFocus>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </div>
    </div>
  )
}
