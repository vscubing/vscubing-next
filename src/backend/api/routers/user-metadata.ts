import { USER_METADATA_DEFAULTS, userMetadataTable } from '@/backend/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const userMetadataRouter = createTRPCRouter({
  userMetadata: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select({
        seenDiscordInvite: userMetadataTable.seenDiscordInvite,
        seenSportcubingAd: userMetadataTable.seenSportcubingAd,
        suspended: userMetadataTable.suspended,
        bio: userMetadataTable.bio,
      })
      .from(userMetadataTable)
      .where(eq(userMetadataTable.userId, ctx.session.user.id))

    const metadata = { ...USER_METADATA_DEFAULTS }
    if (!row) return metadata

    if (row.seenDiscordInvite !== null)
      metadata.seenDiscordInvite = row.seenDiscordInvite
    if (row.seenSportcubingAd !== null)
      metadata.seenSportcubingAd = row.seenSportcubingAd
    if (row.suspended !== null) metadata.suspended = row.suspended
    if (row.bio !== null) metadata.bio = row.bio
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
