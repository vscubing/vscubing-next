import { userSimulatorSettingsTable } from '@/backend/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { z, type ZodType } from 'zod'
import type { TwistySimulatorColorscheme } from 'vendor/cstimer/types'

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

    if (!insertedSettings) throw new Error("couldn't create settings")
    return insertedSettings
  }),
  setSimulatorSettings: protectedProcedure
    .input(
      z.object({
        animationDuration: z.number().optional(),
        inspectionVoiceAlert: z.enum(['Male', 'Female', 'None']).optional(),
        cameraPositionTheta: z.number().optional(),
        cameraPositionPhi: z.number().optional(),
        colorscheme: z
          .object({
            U: z.number(),
            R: z.number(),
            F: z.number(),
            D: z.number(),
            L: z.number(),
            B: z.number(),
          })
          .optional() satisfies ZodType<TwistySimulatorColorscheme | undefined>,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(userSimulatorSettingsTable)
        .set(input)
        .where(eq(userSimulatorSettingsTable.userId, ctx.session.user.id))

      ctx.analytics.capture({
        event: 'simulator_settings_changed',
        distinctId: ctx.session.user.id,
        properties: input,
      })
    }),
})
