'use client'

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { LoadingSpinner } from '@/frontend/ui'
import { useScramble } from './use-scramble'
import { usePersistedSession } from './use-persisted-session'
import { DojoSidebar } from './dojo-sidebar'
import type { Discipline, ResultDnfable } from '@/types'
import { useEventListener } from 'usehooks-ts'
import {
  KeyMapDialogTrigger,
  KeyMapDialogContent,
} from '@/frontend/shared/key-map-dialog'
import { Dialog, DialogOverlay, DialogPortal } from '@/frontend/ui'

const Simulator = lazy(
  () =>
    import('@/app/(app)/contests/[contestSlug]/solve/_components/simulator/components/simulator/simulator.lazy'),
)

type DojoSessionProps = {
  discipline: Discipline
}

export function DojoSession({ discipline }: DojoSessionProps) {
  const { scramble, generateNewScramble } = useScramble(discipline)

  const { solves, isHydrated, addSolve, deleteSolve, clearSession } =
    usePersistedSession()

  const [status, setStatus] = useState<'idle' | 'solving' | 'result'>('idle')
  const [lastResult, setLastResult] = useState<ResultDnfable | null>(null)
  const currentScrambleRef = useRef<string | null>(null)

  // Track if inspection has started (for DNF on escape)
  const [inspectionStarted, setInspectionStarted] = useState(false)

  const handleClearSession = useCallback(() => {
    clearSession()
    setLastResult(null)
  }, [clearSession])

  useEffect(() => {
    if (scramble) {
      currentScrambleRef.current = scramble
    }
  }, [scramble])

  const handleInspectionStart = useCallback(() => {
    setInspectionStarted(true)
    setStatus('solving')
    setLastResult(null)
  }, [])

  const handleSolveFinish = useCallback(
    (solve: { result: ResultDnfable; solution: string }) => {
      addSolve({
        result: solve.result,
        scramble: currentScrambleRef.current ?? '',
        timestamp: Date.now(),
      })

      setLastResult(solve.result)
      setStatus('result')
      setInspectionStarted(false)

      void generateNewScramble()
    },
    [addSolve, generateNewScramble],
  )

  const handleDnf = useCallback(() => {
    if (!inspectionStarted) return

    handleSolveFinish({
      result: { isDnf: true, timeMs: null, plusTwoIncluded: false },
      solution: '',
    })
  }, [inspectionStarted, handleSolveFinish])

  useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && status === 'solving') {
      handleDnf()
    }
  })

  const initSolveData = useMemo(
    () => (scramble ? { scramble, discipline } : null),
    [scramble, discipline],
  )

  if (!initSolveData || !isHydrated) {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='flex h-full gap-3 overflow-hidden'>
      <div className='flex min-h-0 flex-1 flex-col gap-3'>
        {/* Scramble display */}
        <div className='shrink-0 rounded-2xl bg-black-80 p-4'>
          <h3 className='text-sm font-medium text-grey-40'>Scramble</h3>
          <p className='mt-2 break-all font-mono text-lg text-grey-20'>
            {scramble}
          </p>
        </div>

        {/* Simulator area */}
        <div className='relative min-h-0 flex-1 rounded-2xl bg-black-80'>
          <Suspense
            fallback={
              <div className='flex h-full items-center justify-center'>
                <LoadingSpinner />
              </div>
            }
          >
            <Simulator
              initSolveData={initSolveData}
              onSolveFinish={handleSolveFinish}
              onInspectionStart={handleInspectionStart}
              completedResult={lastResult}
            />
          </Suspense>

          {/* Key map dialog trigger */}
          <div className='absolute left-4 top-4'>
            <Dialog>
              <KeyMapDialogTrigger autoFocus={false} className='touch:hidden' />
              <DialogPortal>
                <DialogOverlay className='bg-black-1000/25' withCubes={false} />
                <KeyMapDialogContent
                  onCloseAutoFocus={(e) => {
                    e.preventDefault()
                  }}
                />
              </DialogPortal>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Sidebar with stats and history */}
      <DojoSidebar
        solves={solves}
        onDeleteSolve={deleteSolve}
        onClearSession={handleClearSession}
        className='flex sm:hidden'
      />
    </div>
  )
}
