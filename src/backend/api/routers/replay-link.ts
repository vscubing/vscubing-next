import { z } from 'zod'
import { nanoid } from 'nanoid'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/backend/api/trpc'
import { replayLinkTable } from '@/backend/db/schema/replay-link'
import { DISCIPLINES, isDiscipline } from '@/types'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'

export const replayLinkRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        scramble: z.string().min(1),
        solution: z.string().min(1),
        timeMs: z.number().positive(),
        username: z.string().optional(),
        date: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = nanoid(10)

      await ctx.db.insert(replayLinkTable).values({
        id,
        discipline: input.discipline,
        scramble: input.scramble,
        solution: input.solution,
        timeMs: input.timeMs,
        username: input.username ?? null,
        date: input.date ?? null,
        createdById: ctx.session.user.id,
      })

      return { id }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [link] = await ctx.db
        .select()
        .from(replayLinkTable)
        .where(eq(replayLinkTable.id, input.id))

      if (!link) throw new TRPCError({ code: 'NOT_FOUND' })
      if (!isDiscipline(link.discipline)) throw new TRPCError({ code: 'NOT_FOUND' })

      return {
        discipline: link.discipline,
        scramble: link.scramble,
        solution: link.solution,
        timeMs: link.timeMs,
        username: link.username,
        date: link.date,
      }
    }),
})
