import { useRef, useState, useEffect } from 'react'
import { VOICE_ALERTS } from './voice-alerts-audio'
import { getDisplay } from './get-display'
import { type SimulatorEvent, useTwistySimulator } from './use-simulator'
import {
  INSPECTION_DNF_THRESHHOLD_MS,
  INSPECTION_PLUS_TWO_THRESHHOLD_MS,
} from './constants'
import { PUZZLE_SCALE, type Discipline, type ResultDnfable } from '@/types'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'
import { cn } from '@/frontend/utils/cn'
import { type QuantumMove } from '@vscubing/cubing/alg'
import { useEventCallback, useEventListener } from 'usehooks-ts'
import { toast } from '@/frontend/ui'
import {
  useSimulatorSettings,
  useMutateSimulatorSettings,
} from '@/frontend/shared/simulator/use-simulator-settings'
import Link from 'next/link'

export type InitSolveData = {
  scramble: string
  discipline: Discipline
}

export type SimulatorSolve = {
  result: ResultDnfable
  solution: string
}
export type SimulatorSolveFinishCallback = (solve: SimulatorSolve) => void

type SimulatorProps = {
  initSolveData: InitSolveData
  onInspectionStart: () => void
  onSolveFinish: SimulatorSolveFinishCallback
  jumpStraightToPreinspection: boolean
  dnfOnEscape: boolean
  moveCountLimit: number
}
export default function Simulator({
  initSolveData,
  onInspectionStart,
  onSolveFinish,
  dnfOnEscape,
  moveCountLimit,
  jumpStraightToPreinspection,
}: SimulatorProps) {
  const { data: settingsWithoutDefaults, isLoading: settingsLoading } =
    useSimulatorSettings()
  const { updateSettings } = useMutateSimulatorSettings()
  const settings = {
    animationDuration: settingsWithoutDefaults?.animationDuration ?? 100, // TODO: defaults don't belong here
    cameraPositionPhi: settingsWithoutDefaults?.cameraPositionPhi ?? 6,
    cameraPositionTheta: settingsWithoutDefaults?.cameraPositionTheta ?? 0,
    inspectionVoiceAlert:
      settingsWithoutDefaults?.inspectionVoiceAlert ?? 'Male',
    colorscheme: settingsWithoutDefaults?.colorscheme ?? null,
    puzzleScale: settingsWithoutDefaults?.puzzleScale ?? 1,
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const isTouchDevice = useIsTouchDevice()
  const [status, setStatus] = useState<
    'idle' | 'ready' | 'inspecting' | 'solving' | 'solved' | 'dnf'
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
    containerRef.current?.focus()
    setStatus(jumpStraightToPreinspection ? 'inspecting' : 'ready')

    setSolveStartTimestamp(undefined)
    setInspectionStartTimestamp(undefined)
    setCurrentTimestamp(undefined)
    setSolution([])
    setHeard8sAlert(false)
    setHeard12sAlert(false)
  }, [initSolveData, jumpStraightToPreinspection])

  useEventListener('keydown', (e) => {
    if (status === 'ready') {
      if (e.key === ' ') setStatus('inspecting')
    }
    if (status === 'inspecting' || status === 'solving') {
      applyKeyboardMove(e)
    }
    if (
      (status === 'inspecting' || status === 'solving') &&
      e.code === 'Escape' &&
      dnfOnEscape
    ) {
      onSolveFinish({ solution: '', result: { isDnf: true, timeMs: null } })
      setStatus('dnf')
    }
  })

  useEventListener('keydown', (e) => {
    const prevScale = settingsWithoutDefaults?.puzzleScale
    if (!prevScale) return

    if (e.key === '+') {
      const newScale = Math.min(
        PUZZLE_SCALE.MAX,
        Number((prevScale + PUZZLE_SCALE.STEP).toFixed(2)),
      )
      updateSettings({
        puzzleScale: newScale,
      })
    }
    if (e.key === '-') {
      const newScale = Math.max(
        PUZZLE_SCALE.MIN,
        Number((prevScale - PUZZLE_SCALE.STEP).toFixed(2)),
      )
      updateSettings({ puzzleScale: newScale })
    }
    if (e.key === '=') {
      updateSettings({ puzzleScale: PUZZLE_SCALE.DEFAULT })
    }
  })

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

  const moveHandler = useEventCallback(
    ({ move, isRotation, isSolved }: SimulatorEvent) => {
      if (!solution) throw new Error('[SIMULATOR] moves undefined')
      // NOTE: very important that this uses prevSolution from the argument and not from the state to avoid race conditions on double moves

      const timestamp = getCurrentTimestamp()
      setSolution((prevSolution) => [...prevSolution, { move, timestamp }])

      if (status === 'inspecting') {
        if (isRotation) return
        else {
          setStatus('solving')
          return
        }
      }

      if (status === 'solving' && isSolved) {
        setStatus('solved')
        setCurrentTimestamp(timestamp)
        handleLastMove(move, timestamp)
      }
    },
  )

  function handleLastMove(lastMove: QuantumMove, lastMoveTimestamp: number) {
    if (!currentTimestamp || !solveStartTimestamp || !inspectionStartTimestamp)
      throw new Error(
        `[SIMULATOR] invalid solved state. solution: ${JSON.stringify(solution)}, currentTimestamp: ${currentTimestamp}, solveStartTimestamp: ${solveStartTimestamp}, inspectionStartTimestamp: ${inspectionStartTimestamp}`,
      )

    const totalInspectionMs = solveStartTimestamp - inspectionStartTimestamp
    const rawSolveTimeMs = lastMoveTimestamp - solveStartTimestamp
    const plusTwoPenalty = totalInspectionMs > INSPECTION_PLUS_TWO_THRESHHOLD_MS

    const solutionStr = [
      ...solution,
      { move: lastMove, timestamp: lastMoveTimestamp },
    ]
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
  }

  if (solution.length > moveCountLimit) {
    toast({
      title: 'Move count limit exceeded',
      duration: 'infinite',
      description: (
        <p>
          For reasons of storage space, solves in contests are limited to{' '}
          {moveCountLimit} moves. Please practice in the{' '}
          <Link href='/dojo' className='text-primary-60 hover:underline'>
            Dojo
          </Link>{' '}
          first if necessary.
        </p>
      ),
    })
    setStatus('dnf')
    setSolution([])
    onSolveFinish({
      result: { isDnf: true, timeMs: null, plusTwoIncluded: false },
      solution: '',
    })
  }

  const { applyKeyboardMove } = useTwistySimulator({
    containerRef,
    onMove: moveHandler,
    scramble:
      status === 'inspecting' || status === 'solving' || status === 'solved'
        ? initSolveData.scramble
        : undefined,
    touchCubeEnabled: isTouchDevice ?? false,
    discipline: initSolveData.discipline,
    settings,
    setCameraPosition: ({ phi, theta }) => {
      if (
        phi !== settings?.cameraPositionPhi ||
        theta !== settings?.cameraPositionTheta
      ) {
        updateSettings({
          cameraPositionPhi: phi,
          cameraPositionTheta: theta,
        })
      }
    },
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
        <div
          className={cn(
            'absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-end text-7xl md:bottom-4 md:left-1/2 md:right-auto md:top-auto md:-translate-x-1/2 md:translate-y-0',
          )}
        >
          <span className='[font-family:"M_PLUS_1_Code",monospace]'>
            {status === 'dnf'
              ? 'DNF'
              : getDisplay(
                  solveStartTimestamp,
                  inspectionStartTimestamp,
                  currentTimestamp,
                )}
          </span>
          {(status === 'solved' || status === 'dnf') && (
            <SolveMetadata
              solution={solution}
              solveTime={
                currentTimestamp && solveStartTimestamp
                  ? currentTimestamp - solveStartTimestamp
                  : null
              }
            />
          )}
        </div>
        {status === 'ready' && (
          <span className='absolute bottom-20 z-10 mx-2 flex min-h-20 items-center rounded-[.75rem] bg-black-100 px-10 py-2 text-center font-kanit text-[1.25rem] text-secondary-20 sm:px-4'>
            <span className='hidden touch:inline'>
              Tap on the cube to scramble it and start the preinspection
            </span>
            <span className='touch:hidden'>
              Press space to scramble the cube and start the preinspection
            </span>
          </span>
        )}
        <div
          className='aspect-square h-[57vh] outline-none sm:!h-auto sm:w-full sm:max-w-[34rem] [&>div]:flex'
          style={{
            height: `calc(57vh * ${settings.puzzleScale})`,
            opacity: settingsLoading ? 0 : 1,
          }}
          tabIndex={-1}
          ref={containerRef}
        ></div>
      </div>
    </>
  )
}

function SolveMetadata({
  solution,
  solveTime,
}: {
  solution: { move: QuantumMove; timestamp: number }[]
  solveTime: number | null
}) {
  const firstNonRotationIndex = solution.findIndex(
    ({ move }) => !isRotation(move),
  )
  const turnCount =
    firstNonRotationIndex === -1 ? 0 : solution.length - firstNonRotationIndex
  return (
    <div className='mt-3 flex flex-col items-end text-[.4em] text-grey-40'>
      <span>{turnCount} turns</span>
      <span>
        {solveTime ? (turnCount / (solveTime / 1000)).toFixed(2) : 0} TPS
      </span>
    </div>
  )
}

function getCurrentTimestamp() {
  return Math.floor(performance.now())
}

function isRotation(move: QuantumMove): boolean {
  return ['x', 'y', 'z'].includes(move.toString()[0]!)
}
