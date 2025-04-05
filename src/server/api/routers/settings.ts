import { userSimulatorSettingsTable } from '@/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'

export const settingsRouter = createTRPCRouter({
  simulatorSettings: protectedProcedure.query(async ({ ctx }) => {
    const [settings] = await ctx.db
      .select()
      .from(userSimulatorSettingsTable)
      .where(eq(userSimulatorSettingsTable.userId, ctx.session.user.id))
    if (!settings) throw new Error('settings not found!')
    return settings
  }),
})
