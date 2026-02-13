'use client'

import { useEffect, useMemo, useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import { LayoutHeaderTitlePortal } from '../_layout'
import { ExperimentalBadge } from '@/frontend/shared/experimental-badge'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { cn } from '@/frontend/utils/cn'
import { useLocalStorage } from '@/frontend/utils/use-local-storage'
import { PrimaryButton, SecondaryButton } from '@/frontend/ui/buttons'
import { CheckIcon, RotateCwIcon } from 'lucide-react'
import { keyToMove, type AlgLeaf, Move } from '@vscubing/cubing/alg'
import { isMove } from '@/types'

const LEVELS: Level[] = [
  { id: 'level-1', name: 'Level 1', newMoves: ['R', 'U'] },
  { id: 'level-2', name: 'Level 2', newMoves: ['L', 'D'] },
  { id: 'level-3', name: 'Level 3', newMoves: ['F', 'B'] },
  { id: 'level-4', name: 'Level 4', newMoves: ['M'] },
  { id: 'level-5', name: 'Level 5', newMoves: ['x', 'y', 'z'] },
  { id: 'level-6', name: 'Level 6', newMoves: ['Rw', 'Uw', 'Lw', 'Dw'] },
  { id: 'level-7', name: 'Level 7', newMoves: ['S', 'E'] },
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

  const [scramble, setScramble] = useState('')
  const [progress, setProgress] = useState<ProgressState>({
    currentIndex: 0,
    incorrectMoves: [],
    activeDoubleMove: null,
  })

  const expectedMoves = useMemo(() => invertScramble(scramble), [scramble])
  const expectedInputMoves = useMemo(
    () => expandExpectedMoves(expectedMoves),
    [expectedMoves],
  )
  const expectedInputSteps = useMemo(
    () => buildExpectedInputSteps(expectedMoves),
    [expectedMoves],
  )
  const expectedMoveSteps = useMemo(
    () => getExpectedMoveSteps(expectedMoves),
    [expectedMoves],
  )
  const isLevelComplete =
    expectedMoves.length > 0 &&
    progress.currentIndex >= expectedInputMoves.length &&
    progress.incorrectMoves.length === 0

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

  useEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (isLevelComplete && !isLastLevel(selectedLevel.id)) {
        handleContinue()
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      handleRestart()
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      const lastIncorrect =
        progress.incorrectMoves[progress.incorrectMoves.length - 1]
      if (!lastIncorrect) return
      applyMove(invertMove(lastIncorrect))
      setProgress((prev) => ({
        ...prev,
        incorrectMoves: prev.incorrectMoves.slice(0, -1),
      }))
      return
    }

    const move = keyToMove(cube3x3x3KeyMapping, event)?.toString()
    if (!move || !isMove(move)) return
    if (isLevelComplete) return

    applyMove(move)
    setProgress((prev) => {
      if (prev.incorrectMoves.length > 0) {
        const lastIncorrect =
          prev.incorrectMoves[prev.incorrectMoves.length - 1]
        if (move === invertMove(lastIncorrect)) {
          return {
            ...prev,
            incorrectMoves: prev.incorrectMoves.slice(0, -1),
          }
        }
        const updatedIncorrect = reduceIncorrectMoves([
          ...prev.incorrectMoves,
          move,
        ])
        return {
          ...prev,
          incorrectMoves: updatedIncorrect,
        }
      }

      const expectedStep = expectedInputSteps[prev.currentIndex]
      if (!expectedStep) return prev

      const activeDoubleMove = prev.activeDoubleMove
      const allowedMoves =
        expectedStep.doubleGroupId &&
        activeDoubleMove?.groupId === expectedStep.doubleGroupId
          ? [activeDoubleMove.move]
          : expectedStep.allowedMoves

      if (allowedMoves.includes(move)) {
        let nextActiveDoubleMove = activeDoubleMove
        if (expectedStep.doubleGroupId) {
          if (
            !nextActiveDoubleMove ||
            nextActiveDoubleMove.groupId !== expectedStep.doubleGroupId
          ) {
            nextActiveDoubleMove = {
              groupId: expectedStep.doubleGroupId,
              move,
            }
          }
          if (expectedStep.isDoubleEnd) nextActiveDoubleMove = null
        }
        return {
          currentIndex: prev.currentIndex + 1,
          incorrectMoves: [],
          activeDoubleMove: nextActiveDoubleMove,
        }
      }

      return {
        ...prev,
        incorrectMoves: reduceIncorrectMoves([move]),
      }
    })
  })

  function startLevel(level: LevelWithMoves) {
    const nextScramble = generateScramble(level.moves, SCRAMBLE_LENGTH)
    setScramble(nextScramble)
    setProgress({ currentIndex: 0, incorrectMoves: [], activeDoubleMove: null })
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
          <div className='flex flex-1 flex-col gap-4 rounded-2xl bg-black-80 p-4'>
            <div className='bg-black-90/60 flex flex-wrap items-start justify-between gap-4 rounded-2xl p-4'>
              <div>
                <p className='text-sm text-grey-40'>Selected level</p>
                <h2 className='text-xl font-medium'>{selectedLevel.name}</h2>
              </div>
              <div className='flex flex-1 flex-col gap-2 sm:max-w-[55%]'>
                <p className='text-sm text-grey-40'>Move pool</p>
                <div className='flex flex-wrap gap-2'>
                  {selectedLevel.moves.map((move) => (
                    <span
                      key={move}
                      className='border-white-10 rounded-md border px-2 py-1 font-mono text-sm text-white-100'
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <SecondaryButton
                  onClick={() =>
                    setHideKeyHintsValue(hideKeyHints ? 'false' : 'true')
                  }
                >
                  {hideKeyHints ? 'Show key hints' : 'Hide key hints'}
                </SecondaryButton>
                <SecondaryButton onClick={handleRestart}>
                  <RotateCwIcon className='mr-1 h-4 w-4' />
                  Restart
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleContinue}
                  disabled={!isLevelComplete || isLastLevel(selectedLevel.id)}
                >
                  Continue
                </PrimaryButton>
              </div>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <p className='text-sm text-grey-40'>Solve sequence</p>
                <div className='bg-black-90/60 flex flex-wrap gap-3 rounded-2xl p-4'>
                  {expectedMoveSteps.map(({ move, end }, index) => {
                    const isDone = progress.currentIndex >= end
                    return (
                      <div
                        key={`${move}-${index}`}
                        className='flex min-w-[3.5rem] flex-col items-center gap-1 font-mono'
                      >
                        <span
                          className={cn('text-lg', {
                            'text-white-100': isDone,
                            'text-grey-60': !isDone,
                          })}
                        >
                          {move}
                        </span>
                        {!hideKeyHints && (
                          <span
                            className={cn('text-xs', {
                              'text-white-100': isDone,
                              'text-grey-60': !isDone,
                            })}
                          >
                            {formatKeyLabelsForMove(move).join(' / ')}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className='min-h-[3rem]'>
                  {progress.incorrectMoves.length > 0 && (
                    <div className='rounded-2xl border border-red-100/30 bg-red-100/10 p-3 text-sm text-red-100'>
                      <span className='font-medium'>Incorrect:</span>{' '}
                      {progress.incorrectMoves.join(' ')}
                      <span className='ml-2 text-xs text-red-100/70'>
                        (Backspace to undo)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='bg-black-90/40 flex min-h-[28rem] flex-1 flex-col items-center justify-center rounded-2xl p-4'>
                <div
                  ref={simulatorRef}
                  className='mx-auto aspect-square h-[28rem] w-full max-w-[44rem] outline-none sm:h-[32rem]'
                />
              </div>
            </div>
          </div>

          <aside className='flex w-64 flex-col gap-4 rounded-2xl bg-black-80 p-4'>
            <div>
              <p className='text-sm text-grey-40'>Levels</p>
              <div className='mt-3 flex flex-col gap-3'>
                {LEVELS_WITH_MOVES.map((level) => {
                  const isSelected = level.id === selectedLevelId
                  const isCompleted = completedSet.has(level.id)
                  return (
                    <button
                      key={level.id}
                      onClick={() => handleSelectLevel(level)}
                      className={cn(
                        'rounded-xl border border-transparent p-3 text-left transition',
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
                      <div className='mt-2 flex flex-wrap gap-2 text-xs text-grey-40'>
                        {level.moves.map((move) => (
                          <span
                            key={`${level.id}-${move}`}
                            className='border-white-10 rounded border px-1.5 py-0.5 font-mono'
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
  incorrectMoves: string[]
  activeDoubleMove: ActiveDoubleMove | null
}

type ActiveDoubleMove = {
  groupId: number
  move: string
}

type ExpectedInputStep = {
  move: string
  allowedMoves: string[]
  doubleGroupId?: number
  isDoubleEnd?: boolean
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

function reduceIncorrectMoves(moves: string[]) {
  if (moves.length < 4) return moves
  const lastFour = moves.slice(-4)
  if (lastFour.every((move) => move === lastFour[0])) {
    return moves.slice(0, -4)
  }
  return moves
}

function generateScramble(moves: string[], length: number) {
  const suffixes = ['', "'", '2']
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

function expandExpectedMoves(moves: string[]) {
  return moves.flatMap((move) =>
    move.endsWith('2') ? [baseMove(move), baseMove(move)] : [move],
  )
}

function buildExpectedInputSteps(moves: string[]): ExpectedInputStep[] {
  const steps: ExpectedInputStep[] = []
  let groupId = 0

  moves.forEach((move) => {
    if (!move.endsWith('2')) {
      steps.push({ move, allowedMoves: [move] })
      return
    }

    const base = baseMove(move)
    const inverse = invertMove(base)
    groupId += 1
    steps.push({
      move: base,
      allowedMoves: [base, inverse],
      doubleGroupId: groupId,
    })
    steps.push({
      move: base,
      allowedMoves: [base, inverse],
      doubleGroupId: groupId,
      isDoubleEnd: true,
    })
  })

  return steps
}

function getExpectedMoveSteps(moves: string[]) {
  let cursor = 0
  return moves.map((move) => {
    const length = move.endsWith('2') ? 2 : 1
    const start = cursor
    cursor += length
    return { move, start, end: cursor }
  })
}

function invertMove(move: string) {
  if (move.endsWith('2')) return move
  if (move.endsWith("'")) return move.slice(0, -1)
  return `${move}'`
}

function baseMove(move: string) {
  return move.endsWith('2') ? move.slice(0, -1) : move
}

function isLastLevel(levelId: string) {
  return LEVELS_WITH_MOVES[LEVELS_WITH_MOVES.length - 1]?.id === levelId
}

function formatKeyLabelsForMove(move: string) {
  const isDouble = move.endsWith('2')
  const normalizedMove = isDouble ? move.slice(0, -1) : move
  const keyCodes = MOVE_TO_KEY_CODES[normalizedMove] ?? []
  const keyLabels = keyCodes.map((code) => KEY_LABELS[code] ?? code)

  if (keyLabels.length === 0) return ['?']
  if (!isDouble) return keyLabels

  return keyLabels.map((label) => `${label} ${label}`)
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
