import type { userSimulatorSettingsTable } from '@/backend/db/schema'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import type { QuantumMove } from '@vscubing/cubing/alg'
import { useRef, useState, useEffect } from 'react'
import { useEventCallback } from 'usehooks-ts'
import {
  INSPECTION_DNF_THRESHHOLD_MS,
  INSPECTION_PLUS_TWO_THRESHHOLD_MS,
  MOVECOUNT_LIMIT,
} from './constants'
import { getDisplay } from './get-display'
import type { SimulatorMoveListener } from './use-twisty-simulator'
import { VOICE_ALERTS } from './voice-alerts-audio'
import { toast } from '@/frontend/ui'
import type { InitSolveData, SimulatorSolveFinishCallback } from './types'

export function useSimulatorTimer({
  initSolveData,
  onInspectionStart,
  inspectionVoiceAlert,
  onSolveFinish,
}: {
  initSolveData: InitSolveData
  onInspectionStart: () => void
  inspectionVoiceAlert: (typeof userSimulatorSettingsTable.$inferSelect)['inspectionVoiceAlert']
  onSolveFinish: SimulatorSolveFinishCallback
}) {
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
      void VOICE_ALERTS[inspectionVoiceAlert]['8s'].play()
      setHeard8sAlert(true)
    }
    if (elapsedInspectionMs >= 11_900 && !heard12sAlert) {
      void VOICE_ALERTS[inspectionVoiceAlert]['12s'].play()
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
    inspectionVoiceAlert,
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

  return {
    touchStartHandler,
    display: getDisplay(
      solveStartTimestamp,
      inspectionStartTimestamp,
      currentTimestamp,
    ),
    status,
    containerRef,
    moveHandler,
    hasRevealedScramble: status !== 'idle' && status !== 'ready',
  }
}

function getCurrentTimestamp() {
  return Math.floor(performance.now())
}
