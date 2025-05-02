import type { Move } from '@/types'

export interface ServerToClientEvents {
  ping: () => void
  history: (moves: string) => void
  onMove: (move: Move) => void
}

export interface ClientToServerEvents {
  pong: () => void
  onMove: (move: Move) => void
}
