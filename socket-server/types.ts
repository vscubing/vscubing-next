import type { Move } from '@/types'

export interface ServerToClientEvents {
  pattern: (binaryPattern: Uint8Array) => void
  history: (history: string) => void
  onMove: (move: Move) => void
}

export interface ClientToServerEvents {
  onMove: (move: Move) => void
}
