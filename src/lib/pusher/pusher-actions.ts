'use server'

// const streamScrambles = new Map<string, string>()

import { pusherServer } from './pusher-server'
import type { SolveStream } from './streams'

export async function registerSolveStream(stream: SolveStream) {
  await pusherServer.trigger('presence-solve-streams', 'created', stream)
  console.log('solve-streams', 'created', stream)
}

// export function getStreamScramble(streamId: string) {
//   return streamScrambles.get(streamId)
// }

export async function sendMove(streamId: string, move: string) {
  await pusherServer.trigger(`presence-solve-stream-${streamId}`, 'move', move)
  console.log(`presence-solve-stream-${streamId}`, 'move', move)
}
