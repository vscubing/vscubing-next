'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import { LayoutHeaderTitlePortal } from '../_layout'
import { ExperimentalBadge } from '@/frontend/shared/experimental-badge'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { cn } from '@/frontend/utils/cn'
import { useLocalStorage } from '@/frontend/utils/use-local-storage'
import { PrimaryButton, SecondaryButton } from '@/frontend/ui/buttons'
import { CheckIcon, EyeIcon, EyeOffIcon, RotateCwIcon } from 'lucide-react'
import { keyToMove, type AlgLeaf, Move } from '@vscubing/cubing/alg'
import { isMove } from '@/types'

const LEVELS: Level[] = [
  { id: 'level-1', name: '1. R & U', newMoves: ['R', 'U'] },
  { id: 'level-2', name: '2. Adding F', newMoves: ['F'] },
  { id: 'level-3', name: '3. Adding L', newMoves: ['L'] },
  { id: 'level-4', name: '4. Adding D', newMoves: ['D'] },
  { id: 'level-5', name: '5. All Faces', newMoves: ['B'] },
  { id: 'level-6', name: '6. Rotations', newMoves: ['x', 'y', 'z'] },
  { id: 'level-7', name: '7. Wide Moves I', newMoves: ['Rw', 'Uw'] },
  { id: 'level-8', name: '8. Wide Moves II', newMoves: ['Lw', 'Dw'] },
  { id: 'level-9', name: '9. M Slice', newMoves: ['M'] },
  { id: 'level-10', name: '10. S & E Slices', newMoves: ['S', 'E'] },
]

const LEVELS_WITH_MOVES = LEVELS.map((level, index) => ({
  ...level,
  moves: LEVELS.slice(0, index + 1).flatMap((entry) => entry.newMoves),
}))

const COMPLETED_LEVELS_KEY = 'vs-virtual-tutorial-completed-levels'
const HIDE_KEY_HINTS_KEY = 'vs-virtual-tutorial-hide-key-hints'
const SCRAMBLE_LENGTH = 20

export default function VirtualTutorialPage() {
  const [completedLevelsValue, setCompletedLevelsValue] =
    useLocalStorage<string>(COMPLETED_LEVELS_KEY, '[]')
  const completedLevels = useMemo(
    () => parseStoredLevels(completedLevelsValue),
    [completedLevelsValue],
  )
  const [hideKeyHintsValue, setHideKeyHintsValue] = useLocalStorage<string>(
    HIDE_KEY_HINTS_KEY,
    'false',
  )
  const hideKeyHints = useMemo(
    () => parseStoredBool(hideKeyHintsValue),
    [hideKeyHintsValue],
  )
  const completedSet = useMemo(
    () => new Set(completedLevels ?? []),
    [completedLevels],
  )

  const [selectedLevelId, setSelectedLevelId] = useState(
    LEVELS_WITH_MOVES[0]?.id ?? 'level-1',
  )
  const [activeLevelId, setActiveLevelId] = useState(selectedLevelId)
  const selectedLevel =
    LEVELS_WITH_MOVES.find((level) => level.id === selectedLevelId) ??
    LEVELS_WITH_MOVES[0]
  const selectedNewMoves = useMemo(
    () => new Set(selectedLevel.newMoves),
    [selectedLevel.newMoves],
  )

  const [scramble, setScramble] = useState('')
  const [progress, setProgress] = useState<ProgressState>({
    currentIndex: 0,
  })
  const [errorFlash, setErrorFlash] = useState<ErrorFlash | null>(null)
  const lastKeyRef = useRef<{ code: string; time: number } | null>(null)

  const expectedMoves = useMemo(() => invertScramble(scramble), [scramble])
  const isLevelComplete =
    expectedMoves.length > 0 && progress.currentIndex >= expectedMoves.length

  const { simulatorRef, applyMove } = useControllableSimulator({
    discipline: '3by3',
    scramble,
  })

  useEffect(() => {
    startLevel(selectedLevel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLevelComplete) return
    if (activeLevelId !== selectedLevel.id) return
    if (completedSet.has(selectedLevel.id)) return
    setCompletedLevelsValue(
      JSON.stringify([...(completedLevels ?? []), selectedLevel.id]),
    )
  }, [
    isLevelComplete,
    activeLevelId,
    completedSet,
    selectedLevel.id,
    completedLevels,
    setCompletedLevelsValue,
  ])

  useEffect(() => {
    if (!errorFlash) return
    const timer = window.setTimeout(() => setErrorFlash(null), 300)
    return () => window.clearTimeout(timer)
  }, [errorFlash?.token])

  useEventListener('keydown', (event) => {
    if (event.repeat) return
    if (event.code) {
      const lastKey = lastKeyRef.current
      const now = performance.now()
      if (lastKey && lastKey.code === event.code && now - lastKey.time < 60) {
        return
      }
      lastKeyRef.current = { code: event.code, time: now }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (isLevelComplete && !isLastLevel(selectedLevel.id)) {
        handleContinue()
      }
      return
    }

    if (event.key === ' ' && isLevelComplete) {
      event.preventDefault()
      handleRestart()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      handleRestart()
      return
    }

    const move = keyToMove(cube3x3x3KeyMapping, event)?.toString()
    if (!move || !isMove(move)) return
    if (isLevelComplete) return

    const expectedMove = expectedMoves[progress.currentIndex]
    if (!expectedMove) return

    if (expectedMove === move) {
      applyMove(move)
      setProgress({ currentIndex: progress.currentIndex + 1 })
      return
    }

    setErrorFlash({ index: progress.currentIndex, token: Date.now() })
  })

  function startLevel(level: LevelWithMoves) {
    const nextScramble = generateScramble(level.moves, SCRAMBLE_LENGTH)
    setScramble(nextScramble)
    setProgress({ currentIndex: 0 })
    setErrorFlash(null)
    setActiveLevelId(level.id)
  }

  function handleRestart() {
    if (!selectedLevel) return
    startLevel(selectedLevel)
  }

  function handleContinue() {
    const currentIndex = LEVELS_WITH_MOVES.findIndex(
      (level) => level.id === selectedLevel.id,
    )
    const nextLevel = LEVELS_WITH_MOVES[currentIndex + 1]
    if (!nextLevel) return
    handleSelectLevel(nextLevel)
  }

  function handleSelectLevel(level: LevelWithMoves) {
    setSelectedLevelId(level.id)
    startLevel(level)
  }

  return (
    <>
      <LayoutHeaderTitlePortal>Virtual tutorial</LayoutHeaderTitlePortal>
      <div className='flex flex-1 flex-col gap-3'>
        <ExperimentalBadge />
        <div className='flex flex-1 gap-3'>
          <div className='relative flex flex-1 flex-col gap-4 rounded-2xl bg-black-80 p-4'>
            <div className='absolute inset-4 flex items-center justify-center'>
              <div
                ref={simulatorRef}
                className='aspect-square h-[60%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem]'
              />
            </div>

            {isLevelComplete && (
              <div className='absolute inset-4 flex items-center justify-center rounded-xl bg-black-100/80'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <p className='text-2xl font-semibold text-primary-80'>
                    Level complete!
                  </p>
                  {!isLastLevel(selectedLevel.id) ? (
                    <p className='text-sm text-grey-40'>
                      Press Enter to continue • Space to restart
                    </p>
                  ) : (
                    <p className='text-sm text-grey-40'>
                      Press Space to restart
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className='relative z-10 flex h-full flex-col'>
              <div className='rounded-xl bg-black-100 p-4'>
                <div className='relative flex w-full flex-wrap justify-center gap-1'>
                  {expectedMoves.map((move, index) => {
                    const isDone = index < progress.currentIndex
                    const isErrorFlash = errorFlash?.index === index
                    return (
                      <div
                        key={`${move}-${index}`}
                        className='flex min-w-[2.25rem] flex-col items-center gap-0.5 font-mono'
                      >
                        {!hideKeyHints && (
                          <span
                            className={cn(
                              'text-[0.65rem] transition-colors duration-300',
                              {
                                'text-white-100': isDone,
                                'text-grey-60': !isDone,
                                'text-red-100': isErrorFlash,
                              },
                            )}
                          >
                            {formatKeyLabelsForMove(move).join(' / ')}
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-base transition-colors duration-300',
                            {
                              'text-white-100': isDone,
                              'text-grey-60': !isDone,
                              'text-red-100': isErrorFlash,
                            },
                          )}
                        >
                          {move}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className='flex-1' />
              <p className='text-center text-sm text-grey-40'>
                Escape to restart
              </p>
            </div>
          </div>

          <aside className='flex w-64 flex-col gap-3 rounded-2xl bg-black-80 p-3'>
            <div className='bg-black-90/60 rounded-xl p-2.5'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-white-100'>
                  {selectedLevel.name}
                </p>
                <div className='flex items-center gap-2'>
                  <SecondaryButton
                    size='iconSm'
                    className='h-10 w-10 sm:h-9 sm:w-9'
                    onClick={() =>
                      setHideKeyHintsValue(hideKeyHints ? 'false' : 'true')
                    }
                  >
                    {hideKeyHints ? (
                      <EyeIcon className='h-4 w-4' />
                    ) : (
                      <EyeOffIcon className='h-4 w-4' />
                    )}
                  </SecondaryButton>
                  <SecondaryButton
                    size='iconSm'
                    className='h-10 w-10 sm:h-9 sm:w-9'
                    onClick={handleRestart}
                  >
                    <RotateCwIcon className='h-4 w-4' />
                  </SecondaryButton>
                </div>
              </div>
              <div className='mt-2 flex flex-wrap gap-1.5 pb-2.5'>
                {selectedLevel.moves.map((move) => (
                  <span
                    key={`header-${move}`}
                    className={cn(
                      'rounded-md px-2 py-1 font-mono text-[0.7rem]',
                      selectedNewMoves.has(move)
                        ? 'bg-primary-80/15 text-primary-80'
                        : 'border-white-10 bg-white-10 border text-grey-40',
                    )}
                  >
                    {move}
                  </span>
                ))}
              </div>
              <div className='h-px bg-grey-60/30' />
            </div>
            <div>
              <p className='text-grey-50 text-xs font-semibold uppercase tracking-wide'>
                Levels
              </p>
              <div className='mt-2 flex flex-col gap-2'>
                {LEVELS_WITH_MOVES.map((level) => {
                  const isSelected = level.id === selectedLevelId
                  const isCompleted = completedSet.has(level.id)
                  const newMoves = new Set(level.newMoves)
                  return (
                    <button
                      key={level.id}
                      onClick={() => handleSelectLevel(level)}
                      className={cn(
                        'rounded-xl border border-transparent p-2 text-left transition',
                        {
                          'bg-black-90/60 border-primary-80': isSelected,
                          'hover:border-white-10 hover:bg-black-90/40':
                            !isSelected,
                        },
                      )}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          {level.name}
                        </span>
                        {isCompleted && (
                          <span className='inline-flex items-center gap-1 text-xs text-primary-60'>
                            <CheckIcon className='h-3 w-3' />
                            Done
                          </span>
                        )}
                      </div>
                      <div className='mt-1.5 flex flex-wrap gap-1.5 text-xs text-grey-40'>
                        {level.moves.map((move) => (
                          <span
                            key={`${level.id}-${move}`}
                            className={cn(
                              'rounded border px-1.5 py-0.5 font-mono text-[0.7rem]',
                              newMoves.has(move)
                                ? 'border-primary-80/40 bg-primary-80/15 text-primary-80'
                                : 'border-white-10 text-grey-40',
                            )}
                          >
                            {move}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

type Level = {
  id: string
  name: string
  newMoves: string[]
}

type LevelWithMoves = Level & { moves: string[] }

type ProgressState = {
  currentIndex: number
}

type ErrorFlash = {
  index: number
  token: number
}

function parseStoredLevels(value: string | undefined) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseStoredBool(value: string | undefined) {
  if (!value) return false
  return value === 'true'
}

function generateScramble(moves: string[], length: number) {
  const suffixes = ['', "'"]
  const scramble: string[] = []
  let lastBase = ''

  while (scramble.length < length) {
    const baseMove = moves[Math.floor(Math.random() * moves.length)]
    if (baseMove === lastBase && moves.length > 1) continue
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    scramble.push(`${baseMove}${suffix}`)
    lastBase = baseMove
  }

  return scramble.join(' ')
}

function invertScramble(scramble: string) {
  if (!scramble.trim()) return []
  return scramble
    .trim()
    .split(' ')
    .reverse()
    .map((move) => invertMove(move))
}

function invertMove(move: string) {
  if (move.endsWith("'")) return move.slice(0, -1)
  return `${move}'`
}

function isLastLevel(levelId: string) {
  return LEVELS_WITH_MOVES[LEVELS_WITH_MOVES.length - 1]?.id === levelId
}

function formatKeyLabelsForMove(move: string) {
  const keyCodes = MOVE_TO_KEY_CODES[move] ?? []
  const keyLabels = keyCodes.map((code) => KEY_LABELS[code] ?? code)

  if (keyLabels.length === 0) return ['?']
  return keyLabels
}

const KEY_LABELS: Record<string, string> = {
  Digit1: '1',
  Digit2: '2',
  Digit5: '5',
  Digit6: '6',
  Digit9: '9',
  Digit0: '0',
  KeyI: 'I',
  KeyK: 'K',
  KeyW: 'W',
  KeyO: 'O',
  KeyS: 'S',
  KeyL: 'L',
  KeyD: 'D',
  KeyE: 'E',
  KeyJ: 'J',
  KeyF: 'F',
  KeyH: 'H',
  KeyG: 'G',
  KeyC: 'C',
  KeyR: 'R',
  KeyU: 'U',
  KeyM: 'M',
  KeyX: 'X',
  Comma: ',',
  KeyT: 'T',
  KeyY: 'Y',
  KeyV: 'V',
  KeyN: 'N',
  Semicolon: ';',
  KeyA: 'A',
  KeyP: 'P',
  KeyQ: 'Q',
  KeyZ: 'Z',
  KeyB: 'B',
  Period: '.',
  Slash: '/',
}

const cube3x3x3KeyMapping: Record<number | string, AlgLeaf> = {
  Digit1: new Move("S'"),
  Digit2: new Move('E'),
  Digit5: new Move('M'),
  Digit6: new Move('M'),
  Digit9: new Move("E'"),
  Digit0: new Move('S'),

  KeyI: new Move('R'),
  KeyK: new Move("R'"),
  KeyW: new Move('B'),
  KeyO: new Move("B'"),
  KeyS: new Move('D'),
  KeyL: new Move("D'"),
  KeyD: new Move('L'),
  KeyE: new Move("L'"),
  KeyJ: new Move('U'),
  KeyF: new Move("U'"),
  KeyH: new Move('F'),
  KeyG: new Move("F'"),

  KeyC: new Move("Uw'"),
  KeyR: new Move("Lw'"),
  KeyU: new Move('Rw'),
  KeyM: new Move("Rw'"),

  KeyX: new Move("M'"),
  Comma: new Move('Uw'),

  KeyT: new Move('x'),
  KeyY: new Move('x'),
  KeyV: new Move('Lw'),
  KeyN: new Move("x'"),
  Semicolon: new Move('y'),
  KeyA: new Move("y'"),
  KeyP: new Move('z'),
  KeyQ: new Move("z'"),

  KeyZ: new Move('Dw'),
  KeyB: new Move("x'"),
  Period: new Move("M'"),
  Slash: new Move("Dw'"),
}

const MOVE_TO_KEY_CODES = Object.entries(cube3x3x3KeyMapping).reduce(
  (acc, [key, move]) => {
    const moveLabel = move.toString()
    acc[moveLabel] = acc[moveLabel] ? [...acc[moveLabel], key] : [key]
    return acc
  },
  {} as Record<string, string[]>,
)
