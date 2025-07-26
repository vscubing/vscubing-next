import {
  USER_METADATA_DEFAULTS,
  userMetadataTable,
  userTable,
  type UserMetadata,
} from '@/backend/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const userMetadataRouter = createTRPCRouter({
  userMetadata: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select({
        seenDiscordInvite: userMetadataTable.seenDiscordInvite,
        seenSportcubingAd: userMetadataTable.seenSportcubingAd,
      })
      .from(userMetadataTable)
      .where(eq(userMetadataTable.userId, ctx.session.user.id))

    const metadata = USER_METADATA_DEFAULTS
    if (!row) return metadata

    for (const [key, value] of Object.entries(row)) {
      metadata[key as keyof UserMetadata] = value!
    }
    return metadata
  }),
  updateUserMetadata: protectedProcedure
    .input(
      z.object({
        seenDiscordInvite: z.boolean().optional(),
        seenSportcubingAd: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(userMetadataTable)
        .values({
          userId: ctx.session.user.id,
          ...input,
        })
        .onConflictDoUpdate({
          target: userMetadataTable.userId,
          set: input,
        })
    }),
})
