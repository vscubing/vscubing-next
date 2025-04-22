import { useRef, useState, useEffect, useCallback } from 'react'
import { VOICE_ALERTS } from './voice-alerts-audio'
import { getDisplay } from './get-display'
import {
  type Move,
  type SimulatorMoveListener,
  useTwistySimulator,
} from './use-simulator'
import {
  INSPECTION_DNF_THRESHHOLD_MS,
  INSPECTION_PLUS_TWO_THRESHHOLD_MS,
} from './constants'
import type { Discipline, ResultDnfable } from '@/types'
import type { userSimulatorSettingsTable } from '@/backend/db/schema'
import type { SimulatorCameraPosition } from 'vendor/cstimer'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import { cn } from '@/frontend/utils/cn'

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
  const [solution, setSolution] = useState<{ move: Move; timestamp: number }[]>(
    [],
  )

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

  const moveHandler = useCallback<SimulatorMoveListener>(
    ({ move, isRotation, isSolved }) => {
      setSolution((prev) => {
        if (!prev) throw new Error('[SIMULATOR] moves undefined')
        return [...prev, { move, timestamp: getCurrentTimestamp() }]
      })
      setStatus((prevStatus) => {
        if (prevStatus === 'inspecting' && !isRotation) {
          return 'solving'
        }
        if (prevStatus === 'solving' && isSolved) return 'solved'

        return prevStatus
      })
    },
    [],
  )

  useEffect(() => {
    if (status !== 'solved') return
    const lastMoveTimestamp = solution.at(-1)?.timestamp
    if (
      !solution ||
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
          `${move} /*${Math.max(timestamp - solveStartTimestamp, 0)}*/`,
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
      <style>
        {`
        body {
          overscroll-behavior: none;
        }
        .touchcube {
          position: absolute;
          text-align: center;
          user-select: none;
        }
        .touchcube tr td {
          width: 33%;
          height: 33%;
        }
        .touchcube.active {
          background-color: #6666;
          color: #fffa;
        }
        .touchcube.active td.touchto {
          background-color: #0f0a;
        }
        .touchcube.active td.touchfrom {
          background-color: #f00a;
        }
        .touchcube.board td {
          border: 2px solid #6666;
          border: 0.15rem solid #6666;
        }
        `}
      </style>
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
