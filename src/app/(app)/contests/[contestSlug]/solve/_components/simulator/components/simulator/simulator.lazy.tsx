import { useRef, useState, useEffect } from 'react'
import { VOICE_ALERTS } from './voice-alerts-audio'
import { getDisplay } from './get-display'
import { type SimulatorMoveListener, useTwistySimulator } from './use-simulator'
import {
  INSPECTION_DNF_THRESHHOLD_MS,
  INSPECTION_PLUS_TWO_THRESHHOLD_MS,
} from './constants'
import type { Discipline, ResultDnfable } from '@/types'
import type { userSimulatorSettingsTable } from '@/backend/db/schema'
import type { SimulatorCameraPosition } from 'vendor/cstimer/types'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import { cn } from '@/frontend/utils/cn'
import { type QuantumMove } from '@vscubing/cubing/alg'
import { useEventCallback } from 'usehooks-ts'
import { toast } from '@/frontend/ui'

export const MOVECOUNT_LIMIT = 2000
export type InitSolveData = { scramble: string; discipline: Discipline }

export type SimulatorSolve = {
  result: ResultDnfable
  solution: string
}
export type SimulatorSolveFinishCallback = (solve: SimulatorSolve) => void

type SimulatorProps = {
  initSolveData: InitSolveData
  onInspectionStart: () => void
  onSolveFinish: SimulatorSolveFinishCallback
  settings: Omit<
    typeof userSimulatorSettingsTable.$inferSelect,
    'id' | 'createdAt' | 'updatedAt' | 'userId'
  >
  setCameraPosition: (pos: SimulatorCameraPosition) => void
}
export default function Simulator({
  initSolveData,
  onSolveFinish,
  onInspectionStart,
  settings,
  setCameraPosition,
}: SimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isTouchDevice = useIsTouchDevice()
  const [status, setStatus] = useState<
    'idle' | 'ready' | 'inspecting' | 'solving' | 'solved'
  >('idle')
  const [inspectionStartTimestamp, setInspectionStartTimestamp] =
    useState<number>()
  const [solveStartTimestamp, setSolveStartTimestamp] = useState<number>()
  const [currentTimestamp, setCurrentTimestamp] = useState<number>()
  const [solution, setSolution] = useState<
    { move: QuantumMove; timestamp: number }[]
  >([])

  const [heard8sAlert, setHeard8sAlert] = useState(false)
  const [heard12sAlert, setHeard12sAlert] = useState(false)

  useEffect(() => {
    setStatus(initSolveData ? 'ready' : 'idle')
  }, [initSolveData])

  useEffect(() => {
    if (status !== 'idle' && status !== 'ready') return

    setSolveStartTimestamp(undefined)
    setInspectionStartTimestamp(undefined)
    setCurrentTimestamp(undefined)
    setSolution([])
    setHeard8sAlert(false)
    setHeard12sAlert(false)
  }, [status])

  useEffect(() => {
    if (status !== 'ready') return
    containerRef.current?.focus()

    const abortSignal = new AbortController()
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key === ' ') setStatus('inspecting')
      },
      abortSignal,
    )
    return () => abortSignal.abort()
  }, [status])
  function touchStartHandler(): void {
    if (status === 'ready' && isTouchDevice) setStatus('inspecting')
  }

  useEffect(() => {
    if (status !== 'inspecting') return

    requestAnimationFrame(() =>
      setInspectionStartTimestamp(getCurrentTimestamp()),
    ) // we need requestAnimationFrame here to prevent these timestamps from getting ahead of current timestamp
    onInspectionStart()
  }, [status, onInspectionStart])

  useEffect(() => {
    if (status !== 'solving') return
    requestAnimationFrame(() => setSolveStartTimestamp(getCurrentTimestamp())) // we need requestAnimationFrame here to prevent these timestamps from getting ahead of current timestamp
  }, [status])

  useEffect(() => {
    if (status !== 'inspecting' && status !== 'solving') return
    const abortSignal = new AbortController()

    requestAnimationFrame(function runningThread() {
      if (abortSignal.signal.aborted) return

      setCurrentTimestamp(getCurrentTimestamp())
      requestAnimationFrame(runningThread)
    })

    return () => abortSignal.abort()
  }, [status])

  const elapsedInspectionMs =
    currentTimestamp && inspectionStartTimestamp
      ? currentTimestamp - inspectionStartTimestamp
      : undefined
  useEffect(() => {
    if (status !== 'inspecting' || !elapsedInspectionMs) return

    if (elapsedInspectionMs >= 7_900 && !heard8sAlert) {
      void VOICE_ALERTS[settings.inspectionVoiceAlert]['8s'].play()
      setHeard8sAlert(true)
    }
    if (elapsedInspectionMs >= 11_900 && !heard12sAlert) {
      void VOICE_ALERTS[settings.inspectionVoiceAlert]['12s'].play()
      setHeard12sAlert(true)
    }
    if (elapsedInspectionMs > INSPECTION_DNF_THRESHHOLD_MS) {
      onSolveFinish({
        result: { isDnf: true, timeMs: null, plusTwoIncluded: false },
        solution: '',
      })
      setStatus('idle')
    }
  }, [
    status,
    elapsedInspectionMs,
    heard12sAlert,
    heard8sAlert,
    onSolveFinish,
    settings.inspectionVoiceAlert,
  ])

  const unstableMoveHandler: SimulatorMoveListener = ({
    move,
    isRotation,
    isSolved,
  }) => {
    setSolution((prevSolution) => [
      // NOTE: very important that this uses prevSolution from the argument and not from the state to avoid race conditions on double moves
      ...prevSolution,
      { move, timestamp: getCurrentTimestamp() },
    ])

    if (status === 'inspecting' && !isRotation) {
      setStatus('solving')
    } else if (status === 'solving' && isSolved) {
      setStatus('solved')
    }
  }
  const moveHandler = useEventCallback(unstableMoveHandler)

  if (solution.length > MOVECOUNT_LIMIT) {
    toast({
      title: 'Move count limit exceeded',
      duration: 'infinite',
      description: (
        <p>
          For reasons of storage space, solves are limited to {MOVECOUNT_LIMIT}{' '}
          moves. Please practice at{' '}
          <a
            className='text-primary-60 hover:underline'
            href='https://cstimer.net/'
          >
            csTimer.net
          </a>{' '}
          first if necessary.
        </p>
      ),
    })
    setStatus('idle')
    setSolution([])
    onSolveFinish({
      result: { isDnf: true, timeMs: null, plusTwoIncluded: false },
      solution: '',
    })
  }

  useEffect(() => {
    if (status !== 'solved') return

    const lastMoveTimestamp = solution.at(-1)?.timestamp
    if (
      !lastMoveTimestamp ||
      !currentTimestamp ||
      !solveStartTimestamp ||
      !inspectionStartTimestamp
    )
      throw new Error(
        `[SIMULATOR] invalid solved state. solution: ${JSON.stringify(solution)}, currentTimestamp: ${currentTimestamp}, solveStartTimestamp: ${solveStartTimestamp}, inspectionStartTimestamp: ${inspectionStartTimestamp}`,
      )

    const totalInspectionMs = solveStartTimestamp - inspectionStartTimestamp
    const rawSolveTimeMs = lastMoveTimestamp - solveStartTimestamp
    const plusTwoPenalty = totalInspectionMs > INSPECTION_PLUS_TWO_THRESHHOLD_MS

    const solutionStr = solution
      .map(
        ({ move, timestamp }) =>
          `${move.toString()} /*${Math.max(timestamp - solveStartTimestamp, 0)}*/`,
      )
      .join(' ')
    onSolveFinish({
      result: {
        timeMs: rawSolveTimeMs + (plusTwoPenalty ? 2_000 : 0),
        isDnf: false,
        plusTwoIncluded: plusTwoPenalty,
      },
      solution: solutionStr,
    })
    setStatus('idle')
  }, [
    status,
    solution,
    inspectionStartTimestamp,
    solveStartTimestamp,
    currentTimestamp,
    onSolveFinish,
  ])

  const hasRevealedScramble = status !== 'idle' && status !== 'ready'
  useTwistySimulator({
    containerRef,
    onMove: moveHandler,
    scramble: hasRevealedScramble ? initSolveData.scramble : undefined,
    touchCubeEnabled: isTouchDevice ?? false,
    discipline: initSolveData.discipline,
    settings,
    setCameraPosition,
  })

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href='https://fonts.googleapis.com/css2?family=M+PLUS+1+Code&display=swap'
        rel='stylesheet'
      />
      <div
        className='relative flex h-full items-center justify-center'
        onTouchStart={touchStartHandler}
      >
        <span
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 text-7xl [font-family:"M_PLUS_1_Code",monospace] md:bottom-4 md:left-1/2 md:right-auto md:top-auto md:-translate-x-1/2 md:translate-y-0',
          )}
        >
          {getDisplay(
            solveStartTimestamp,
            inspectionStartTimestamp,
            currentTimestamp,
          )}
        </span>
        {status === 'ready' && (
          <span className='absolute bottom-20 mx-2 flex min-h-20 items-center rounded-[.75rem] bg-black-100 px-10 py-2 text-center font-kanit text-[1.25rem] text-secondary-20 sm:px-4'>
            <span className='hidden touch:inline'>
              Tap on the cube to scramble it and start the preinspection
            </span>
            <span className='touch:hidden'>
              Press space to scramble the cube and start the preinspection
            </span>
          </span>
        )}
        <div
          className='aspect-square h-[60%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem] [&>div]:flex'
          tabIndex={-1}
          ref={containerRef}
        ></div>
      </div>
    </>
  )
}

function getCurrentTimestamp() {
  return Math.floor(performance.now())
}
