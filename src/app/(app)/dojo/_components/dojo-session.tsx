'use client'

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { LoadingSpinner, SecondaryButton, SettingIcon } from '@/frontend/ui'
import { useScramble } from './use-scramble'
import { usePersistedSession } from './use-persisted-session'
import { DojoSidebar } from './dojo-sidebar'
import type { Discipline, ResultDnfable } from '@/types'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import {
  KeyMapDialogTrigger,
  KeyMapDialogContent,
} from '@/frontend/shared/key-map-dialog'
import { Dialog, DialogOverlay, DialogPortal } from '@/frontend/ui'
import { useUser } from '@/frontend/shared/use-user'
import { env } from '@/env'
import Link from 'next/link'

const Simulator = lazy(
  () =>
    import('@/app/(app)/contests/[contestSlug]/solve/_components/simulator/components/simulator/simulator.lazy'),
)

type DojoSessionProps = {
  discipline: Discipline
}

export function DojoSession({ discipline }: DojoSessionProps) {
  const [easyMode, setEasyMode] = useState(false)
  const { scramble, nextScramble, moveToNextScramble } = useScramble(
    discipline,
    easyMode,
  )
  const [jumpStraightToPreinspection, setJumpStraightToPreinspection] =
    useState(false)
  const { user } = useUser()

  const { solves, isHydrated, addSolve, deleteSolve, clearSession } =
    usePersistedSession()

  const [status, setStatus] = useState<'idle' | 'solving' | 'result'>('idle')

  const handleInspectionStart = useCallback(() => {
    setStatus('solving')
  }, [])

  const handleSolveFinish = useEventCallback(
    (solve: { result: ResultDnfable; solution: string }) => {
      addSolve({
        result: solve.result,
        scramble: scramble ?? '',
        reconstruction: solve.solution,
        timestamp: Date.now(),
      })

      setStatus('result')
    },
  )

  useEventListener('keydown', (e) => {
    if (e.code === 'Space' && status === 'result') {
      void moveToNextScramble()
      setJumpStraightToPreinspection(true)
      setStatus('solving')
    }
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJumpStraightToPreinspection(false)
  }, [discipline, easyMode])

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
    <div className='flex min-h-0 flex-1 gap-3'>
      <div className='flex min-h-0 flex-1 flex-col gap-3'>
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
              jumpStraightToPreinspection={jumpStraightToPreinspection}
              dnfOnEscape
              moveCountLimit={Infinity}
            />
          </Suspense>

          {/* Key map dialog trigger */}
          <div className='absolute right-4 top-4 flex items-center gap-4 sm:right-2 sm:top-2 sm:flex-col-reverse sm:items-end sm:gap-0'>
            <Dialog>
              <KeyMapDialogTrigger className='touch:hidden' />
              <DialogPortal>
                <DialogOverlay className='bg-black-1000/40' withCubes={false} />
                <KeyMapDialogContent />
              </DialogPortal>
            </Dialog>
            {user && (
              <SecondaryButton asChild className='h-11 w-11 p-0 sm:h-11'>
                <Link href='/settings'>
                  <SettingIcon />
                </Link>
              </SecondaryButton>
            )}
          </div>
        </div>

        {/* Scramble display */}
        <div className='shrink-0 rounded-2xl bg-black-80 p-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-grey-40'>Scramble</h3>
            {env.NEXT_PUBLIC_APP_ENV !== 'production' && (
              <label className='flex items-center gap-2 text-sm text-grey-40'>
                <input
                  type='checkbox'
                  checked={easyMode}
                  onChange={(e) => setEasyMode(e.target.checked)}
                  className='h-4 w-4'
                />
                Easy mode (just for testing)
              </label>
            )}
          </div>
          <p className='mt-2 break-all font-mono text-lg text-grey-20'>
            {status === 'result' ? nextScramble : scramble}
          </p>
        </div>
      </div>

      {/* Sidebar with stats and history */}
      <DojoSidebar
        solves={solves}
        username={user?.name}
        onDeleteSolve={deleteSolve}
        onClearSession={() => clearSession()}
        className='flex sm:hidden'
      />
    </div>
  )
}
