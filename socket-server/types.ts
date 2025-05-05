import type { Move } from '@/types'
import type { KPatternData } from '@vscubing/cubing/kpuzzle'

export interface ServerToClientEvents {
  pattern: (pattern: KPatternData) => void
  history: (history: string) => void
  onMove: (move: Move) => void
}

export interface ClientToServerEvents {
  onMove: (move: Move) => void
}
