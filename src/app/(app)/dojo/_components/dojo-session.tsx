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
import { DojoSidebar } from './dojo-sidebar'
import type { DojoSolve } from './calculate-stats'
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

const STORAGE_KEY = 'dojo-session'

type StoredSession = {
  solves: DojoSolve[]
  solveIdCounter: number
}

function loadSession(): StoredSession | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as StoredSession
  } catch {
    return null
  }
}

function saveSession(session: StoredSession) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Ignore storage errors
  }
}

type DojoSessionProps = {
  discipline: Discipline
}

export function DojoSession({ discipline }: DojoSessionProps) {
  const {
    scramble,
    isLoading: scrambleLoading,
    generateNewScramble,
  } = useScramble(discipline)

  const [solves, setSolves] = useState<DojoSolve[]>([])
  const [solveIdCounter, setSolveIdCounter] = useState(1)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadSession()
    if (stored) {
      setSolves(stored.solves)
      setSolveIdCounter(stored.solveIdCounter)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage when solves change
  useEffect(() => {
    if (!isHydrated) return
    saveSession({ solves, solveIdCounter })
  }, [solves, solveIdCounter, isHydrated])

  const handleDeleteSolve = useCallback((id: number) => {
    setSolves((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleClearSession = useCallback(() => {
    setSolves([])
    setSolveIdCounter(1)
    setLastResult(null)
  }, [])

  const [status, setStatus] = useState<'idle' | 'solving' | 'result'>('idle')
  const [lastResult, setLastResult] = useState<ResultDnfable | null>(null)
  const currentScrambleRef = useRef<string | null>(null)

  // Track if inspection has started (for DNF on escape)
  const [inspectionStarted, setInspectionStarted] = useState(false)

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
      const newSolve: DojoSolve = {
        id: solveIdCounter,
        result: solve.result,
        scramble: currentScrambleRef.current ?? '',
        timestamp: Date.now(),
      }

      setSolves((prev) => [newSolve, ...prev])
      setSolveIdCounter((prev) => prev + 1)
      setLastResult(solve.result)
      setStatus('result')
      setInspectionStarted(false)

      void generateNewScramble()
    },
    [solveIdCounter, generateNewScramble],
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

  if (scrambleLoading || !initSolveData || !isHydrated) {
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
        onDeleteSolve={handleDeleteSolve}
        onClearSession={handleClearSession}
        className='flex sm:hidden'
      />
    </div>
  )
}
