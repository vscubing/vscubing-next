import {
  contestsTable,
  contestsToDisciplinesTable,
  disciplinesTable,
  postsTable,
} from '@/server/db/schema'
import { DISCIPLINES } from '@/shared'
import { eq, desc } from 'drizzle-orm'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const contestRouter = createTRPCRouter({
  infinitePastContests: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        offset: z.number().min(1).nullish(),
        limit: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(contestsTable)
        .leftJoin(
          contestsToDisciplinesTable,
          eq(contestsToDisciplinesTable.contestId, contestsTable.id),
        )
        .leftJoin(
          disciplinesTable,
          eq(contestsToDisciplinesTable.disciplineSlug, disciplinesTable.slug),
        )
        .where(eq(disciplinesTable.slug, input.discipline))
        .orderBy(desc(contestsTable.startDate))
        .limit(input.limit)
        .offset(input.offset)
    }),

  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(postsTable).values({
        name: input.name,
        createdById: ctx.session.user.id,
      })
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.postsTable.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    })

    return post ?? null
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!'
  }),
})
