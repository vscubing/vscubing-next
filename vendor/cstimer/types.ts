export type {
  Puzzle as TwistySimulatorPuzzle,
  CameraPosition as SimulatorCameraPosition,
  MoveListener as TwistySimulatorMoveListener,
} from './puzzlefactory'

export type { Colorscheme as TwistySimulatorColorscheme }

type Colorscheme = (typeof TWISTY_SIMULATOR_COLORSCHEMES)[number]
export const TWISTY_SIMULATOR_COLORSCHEMES = [
  'default',
  'colorblind-slight',
  'colorblind-kyo-takano',
] as const
