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
import type { ResultDnfish } from '@/types'
import type { userSimulatorSettingsTable } from '@/server/db/schema'
import type { SimulatorCameraPosition } from 'vendor/cstimer'

export type InitSolveData = { scramble: string; discipline: string }

export type SimulatorSolve = {
  result: ResultDnfish
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
      onSolveFinish({ result: { isDnf: true, timeMs: null }, solution: '' })
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
    const penalty =
      totalInspectionMs > INSPECTION_PLUS_TWO_THRESHHOLD_MS ? 2_000 : 0

    const solutionStr = solution
      .map(
        ({ move, timestamp }) =>
          `${move} /*${Math.max(timestamp - solveStartTimestamp, 0)}*/`,
      )
      .join(' ')
    onSolveFinish({
      result: {
        timeMs: rawSolveTimeMs + penalty,
        isDnf: false,
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
      <div className='relative flex h-full items-center justify-center'>
        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-7xl [font-family:"M_PLUS_1_Code",monospace] md:bottom-4 md:left-1/2 md:right-auto md:top-auto md:-translate-x-1/2 md:translate-y-0'>
          {getDisplay(
            solveStartTimestamp,
            inspectionStartTimestamp,
            currentTimestamp,
          )}
        </span>
        {status === 'ready' && (
          <span className='absolute bottom-20 rounded-[.75rem] bg-black-100 px-10 py-6 font-kanit text-[1.25rem] text-secondary-20'>
            Press space to scramble the cube and start the preinspection
          </span>
        )}
        <div
          className='h-[60%] outline-none [&>div]:flex'
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
