import {
  USER_METADATA_DEFAULTS,
  userMetadataTable,
  userTable,
  type UserMetadata,
} from '@/backend/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'

export const userMetadataRouter = createTRPCRouter({
  userMetadata: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select({ seenSportcubingAd: userMetadataTable.seenSportcubingAd })
      .from(userMetadataTable)
      .where(eq(userMetadataTable.userId, ctx.session.user.id))

    const metadata = USER_METADATA_DEFAULTS
    if (!row) return metadata

    for (const [key, value] of Object.entries(row)) {
      metadata[key as keyof UserMetadata] = value!
    }
    console.log(row, metadata)
    return metadata
  }),
  setSeenSportcubingAd: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .insert(userMetadataTable)
      .values({ userId: ctx.session.user.id, seenSportcubingAd: true })
      .onConflictDoUpdate({
        target: userTable.id,
        set: { seenSportcubingAd: true },
      })
  }),
})
