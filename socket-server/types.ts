import type { Move } from '@/types'
import type { ExperimentalBinary3x3x3Pattern } from '@vscubing/cubing/protocol'

export interface ServerToClientEvents {
  pattern: (binaryPattern: ExperimentalBinary3x3x3Pattern) => void
  history: (history: string) => void
  onMove: (move: Move) => void
}

export interface ClientToServerEvents {
  onMove: (move: Move) => void
}
