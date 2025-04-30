'use server'

import type { Discipline } from '@/types'
// const streamScrambles = new Map<string, string>()

import { pusherServer } from './pusher-server'

export async function registerSolveStream(stream: {
  streamId: string
  scramble: string
  discipline: Discipline
}) {
  await pusherServer.trigger('solve-streams', 'created', stream)
  console.log('solve-streams', 'created', stream)
}

// export function getStreamScramble(streamId: string) {
//   return streamScrambles.get(streamId)
// }

export async function sendMove(streamId: string, move: string) {
  await pusherServer.trigger(`presence-solve-stream-${streamId}`, 'move', move)
  console.log(`presence-solve-stream-${streamId}`, 'move', move)
}
