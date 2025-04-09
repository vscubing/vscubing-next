import { userSimulatorSettingsTable } from '@/backend/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const settingsRouter = createTRPCRouter({
  simulatorSettings: protectedProcedure.query(async ({ ctx }) => {
    const [settings] = await ctx.db
      .select()
      .from(userSimulatorSettingsTable)
      .where(eq(userSimulatorSettingsTable.userId, ctx.session.user.id))
    if (settings) return settings

    const [insertedSettings] = await ctx.db
      .insert(userSimulatorSettingsTable)
      .values({ userId: ctx.session.user.id })
      .returning()
    return insertedSettings!
  }),
  setSimulatorSettings: protectedProcedure
    .input(
      z.object({
        animationDuration: z.number().optional(),
        inspectionVoiceAlert: z.enum(['Male', 'Female', 'None']).optional(),
        cameraPositionTheta: z.number().optional(),
        cameraPositionPhi: z.number().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(userSimulatorSettingsTable)
        .set({ ...input })
        .where(eq(userSimulatorSettingsTable.userId, ctx.session.user.id)),
    ),
})
