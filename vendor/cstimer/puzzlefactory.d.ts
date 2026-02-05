import type { TwistySimulatorColorscheme as Colorscheme } from '.'

export function init(
  options: Options,
  moveListener: MoveListener,
  cameraPositionListener: CameraPositionListener,
  parent,
): Promise<Puzzle>

export type MoveListener = (
  move: CsMove,
  mstep: Mstep,
  timestamp: number,
) => void
type CameraPositionListener = (pos: CameraPosition) => void

export type PuzzleFace = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

/**
 * @description hex colors (default: white red green yellow orange blue)
 */
type Colorscheme = Record<PuzzleFace, number>

type Options = {
  dimension: 2 | 3 | 4
  animationDuration: number
  allowDragging: boolean
  colorscheme?: Colorscheme
}
export type CameraPosition = { theta: number; phi: number }

export class Puzzle {
  constructor(twistyScene, twisty)
  keydown(event: KeyboardEvent): void
  resize(): void
  addMoves(...args): unknown
  applyMoves(
    args,
    timestamp: number | undefined,
    applyingScramble: boolean,
  ): void
  setCameraPosition(position: CameraPosition): void
  addMoveListener(listener): unknown
  getDomElement(): unknown
  isRotation(move: CsMove): boolean
  move2str(move: CsMove): string
  moveInv(move): unknown
  toggleColorVisible(args): unknown
  isSolved(args?: unknown): number
  moveCnt(clr): unknown
  parseScramble(
    scramble,
    addPreScr?: boolean,
  ): [number, number, string, number][]
  applyPattern(
    pattern: Record<string, { pieces: number[]; orientation: number[] }>,
  ): void
}

type CsMove = [number, number, string, number]

type Mstep = MstepStart | MstepDoing | MstepFinish
type MstepStart = 0
type MstepDoing = 1
type MstepFinish = 2
