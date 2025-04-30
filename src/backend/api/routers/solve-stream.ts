import { pusherServer } from '@/lib/pusher/pusher-server'
import { solveStreamSchema, type SolveStream } from '@/lib/pusher/streams'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const solveStreamRouter = createTRPCRouter({
  registerSolveStream: protectedProcedure
    .input(solveStreamSchema)
    .mutation(async ({ input }) => {
      solveStreamsRef.current.set(input.streamId, {
        discipline: input.discipline,
        scramble: input.scramble,
        moves: [],
      })
      console.log('updated getSolveStreams:', solveStreamsRef.current)
      await pusherServer.trigger('presence-solve-streams', 'created', input)
      console.log('presence-solve-streams', 'created', input)
    }),

  unregisterSolveStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ input }) => {
      solveStreamsRef.current.delete(input.streamId)
      await pusherServer.trigger('presence-solve-streams', 'deleted', input)
    }),

  sendMove: protectedProcedure
    .input(z.object({ streamId: z.string(), move: z.string() }))
    .mutation(async ({ input }) => {
      const stream = solveStreamsRef.current.get(input.streamId)
      if (!stream) throw new Error('stream not found')
      stream.moves.push(input.move)
      await pusherServer.trigger(
        `presence-solve-stream-${input.streamId}`,
        'move',
        input.move,
      )
      console.log(`presence-solve-stream-${input.streamId}`, 'move', input.move)
    }),

  getActiveStreams: publicProcedure.query(() => {
    console.log('getActiveStreams', solveStreamsRef.current)
    return Array.from(solveStreamsRef.current.entries()).map(
      ([streamId, { discipline, scramble }]) => ({
        streamId,
        discipline,
        scramble,
      }),
    )
  }),

  getStreamMoves: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .query(({ input }) => {
      const stream = solveStreamsRef.current.get(input.streamId)
      if (!stream) {
        console.log('error', solveStreamsRef.current, input.streamId)
        throw new Error('stream not found')
      }
      return stream.moves
      // await new Promise((res) => setTimeout(res, 3000)) // TODO: handle resumability with latency (idea: establish connection first, then fetch moves, remove overlapping and concatenate)
    }),
})

const solveStreamsRef = {
  current: new Map<
    string,
    Omit<SolveStream, 'streamId'> & { moves: string[] }
  >(),
}
