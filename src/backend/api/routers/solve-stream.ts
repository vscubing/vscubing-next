import { pusherServer } from '@/lib/pusher/pusher-server'
import { type SolveStream, type SolveStreamMove } from '@/lib/pusher/streams'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { DISCIPLINES, moveSchema, type Move } from '@/types'

export const solveStreamRouter = createTRPCRouter({
  registerSolveStream: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        scramble: z.string(),
        streamId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      solveStreams.set(input.streamId, {
        discipline: input.discipline,
        scramble: input.scramble,
        moves: [],
        ended: false,
      })
      console.log('updated getSolveStreams:', solveStreams)
      await pusherServer.trigger('presence-solve-streams', 'created', input)
      console.log('presence-solve-streams', 'created', input)
    }),

  unregisterSolveStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ input }) => {
      const stream = solveStreams.get(input.streamId)
      if (!stream) {
        console.log('error', solveStreams, input.streamId)
        throw new Error('stream not found')
      }
      stream.ended = true
      await pusherServer.trigger('presence-solve-streams', 'ended', input)
    }),

  sendMove: protectedProcedure
    .input(
      z.object({
        streamId: z.string(),
        move: moveSchema,
        isSolved: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const stream = solveStreams.get(input.streamId)
      if (!stream) throw new Error('stream not found')
      stream.moves.push(input.move)
      await pusherServer.trigger(
        `presence-solve-stream-${input.streamId}`,
        'move',
        {
          move: input.move,
          idx: stream.moves.length - 1,
          isSolved: input.isSolved,
        } satisfies SolveStreamMove,
      )
      console.log(`presence-solve-stream-${input.streamId}`, 'move', input.move)
    }),

  getActiveStreams: publicProcedure.query(() => {
    console.log('getActiveStreams', solveStreams)
    return Array.from(solveStreams.entries())
      .filter(([, { ended }]) => !ended)
      .map(([streamId, { discipline, scramble, ended }]) => ({
        streamId,
        discipline,
        scramble,
        ended,
      }))
  }),

  getStreamMoves: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .query(({ input }) => {
      const stream = solveStreams.get(input.streamId)
      if (!stream) {
        console.log('error', solveStreams, input.streamId)
        throw new Error('stream not found')
      }
      return stream.moves as Move[]
    }),
})

const solveStreams = new Map<
  string,
  Omit<SolveStream, 'streamId'> & { moves: string[] }
>()
