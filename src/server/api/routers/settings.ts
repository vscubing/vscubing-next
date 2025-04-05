import { createTRPCRouter, protectedProcedure } from '../trpc'

export const settingsRouter = createTRPCRouter({
  getPastContests: protectedProcedure.query(async ({ ctx, input }) => {}),
})
