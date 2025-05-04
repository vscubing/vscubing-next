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

type PuzzleFaces = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

/**
 * @description hex colors (default: white red green yellow orange blue)
 */
type Colorscheme = Record<PuzzleFaces, number>

type Options = {
  puzzle: 'cube2' | 'cube3'
  animationDuration: number
  allowDragging: boolean
  colorscheme: Colorscheme
}
export type CameraPosition = { theta: number; phi: number }

export class Puzzle {
  constructor(twistyScene, twisty)
  keydown(args): unknown
  resize(): unknown
  addMoves(args): unknown
  applyMoves(
    args,
    timestamp: number | undefined,
    applyingScramble: boolean,
  ): unknown
  setCameraPosition(position: CameraPosition): void
  addMoveListener(listener): unknown
  getDomElement(): unknown
  isRotation(move: CsMove): boolean
  move2str(move: CsMove): string
  moveInv(move): unknown
  toggleColorVisible(args): unknown
  isSolved(args?: unknown): number
  moveCnt(clr): unknown
  parseScramble(scramble, addPreScr?: boolean): unknown
}

type CsMove = [number, number, string, number]

type Mstep = MstepStart | MstepDoing | MstepFinish
type MstepStart = 0
type MstepDoing = 1
type MstepFinish = 2
