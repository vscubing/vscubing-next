import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import {
  contestsTable,
  contestsToDisciplinesTable,
  disciplinesTable,
} from '@/server/db/schema'
import { DISCIPLINES } from '@/shared'
import { eq, desc, and, lt } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const contestRouter = createTRPCRouter({
  pastContests: publicProcedure
    .input(
      z.object({
        discipline: z.enum(DISCIPLINES),
        cursor: z.string().optional(),
        limit: z.number().min(1).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select()
        .from(contestsTable)
        .leftJoin(
          contestsToDisciplinesTable,
          eq(contestsToDisciplinesTable.contestSlug, contestsTable.slug),
        )
        .leftJoin(
          disciplinesTable,
          eq(contestsToDisciplinesTable.disciplineSlug, disciplinesTable.slug),
        )
        .where(
          and(
            eq(contestsTable.isOngoing, false),
            eq(disciplinesTable.slug, input.discipline),
            input.cursor
              ? lt(contestsTable.startDate, input.cursor)
              : undefined,
          ),
        )
        .orderBy(desc(contestsTable.startDate))
        .limit(input.limit + 1)

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        nextCursor = items.pop()?.contest.startDate
      }

      return { items, nextCursor }
    }),

  ongoing: publicProcedure.query(async ({ ctx }) => {
    const ongoingList = await ctx.db
      .select()
      .from(contestsTable)
      .where(eq(contestsTable.isOngoing, true))

    if (!ongoingList || ongoingList.length === 0)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No ongoing contest!',
      })
    if (ongoingList.length > 1)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'More then one ongoing contest!',
      })

    return ongoingList[0]!
  }),
})
