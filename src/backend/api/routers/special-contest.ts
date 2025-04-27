import { createNewContest } from '@/backend/shared/contest-management'
import { DISCIPLINES } from '@/types'
import { tryCatch } from '@/utils/try-catch'
import { z } from 'zod'
import {
  adminProcedure,
  createTRPCRouter,
  isAdmin,
  publicProcedure,
} from '../trpc'

export const specialContestRouter = createTRPCRouter({
  canManage: publicProcedure.query(({ ctx }) => isAdmin(ctx.session?.user)),
  create: adminProcedure
    .input(
      z.object({ disciplines: z.array(z.enum(DISCIPLINES)), name: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = `special-${input.name.toLowerCase().split(' ').join('-')}`
      const { data, error } = await tryCatch(
        createNewContest({
          slug,
          type: 'special',
          easyScrambles: true,
          tx: ctx.db,
        }),
      )
      if (error?.message.includes('duplicate key value')) {
        return { error: 'CONFLICT', data: null }
      }
      if (error) {
        console.error(error)
        return { error: 'INTERNAL_SERVER_ERROR', data: null }
      }

      return { data, error: null }
    }),
})
