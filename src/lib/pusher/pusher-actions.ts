'use server'

import { pusherServer } from './pusher-server'
import type { SolveStream } from './streams'

const solveStreams = new Map<
  string,
  Omit<SolveStream, 'streamId'> & { moves: string[] }
>()

export async function registerSolveStream(stream: SolveStream) {
  solveStreams.set(stream.streamId, {
    discipline: stream.discipline,
    scramble: stream.scramble,
    moves: [],
  })
  await pusherServer.trigger('presence-solve-streams', 'created', stream)
  console.log('presence-solve-streams', 'created', stream)
}

export async function sendMove(streamId: string, move: string) {
  const stream = solveStreams.get(streamId)
  if (!stream) throw new Error('stream not found')
  stream.moves.push(move)
  await pusherServer.trigger(`presence-solve-stream-${streamId}`, 'move', move)
  console.log(`presence-solve-stream-${streamId}`, 'move', move)
}

export async function getActiveStreams(): Promise<SolveStream[]> {
  return Array.from(solveStreams.entries()).map(
    ([streamId, { discipline, scramble }]) => ({
      streamId,
      discipline,
      scramble,
    }),
  )
}

export async function getStreamMoves(streamId: string): Promise<string[]> {
  const stream = solveStreams.get(streamId)
  if (!stream) throw new Error('stream not found')
  return stream.moves
  // await new Promise((res) => setTimeout(res, 3000)) // TODO: handle resumability with latency
}
