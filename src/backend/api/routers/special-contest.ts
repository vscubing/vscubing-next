import { createNewContest } from '@/backend/shared/contest-management'
import { DISCIPLINES, type SessionUser } from '@/types'
import { tryCatch } from '@/lib/utils/try-catch'
import { z } from 'zod'
import { createTRPCRouter, isAdmin, publicProcedure } from '../trpc'
import { env } from '@/env'
import { TRPCError } from '@trpc/server'

export function canManageSpecials(user?: SessionUser) {
  return isAdmin(user) && env.NEXT_PUBLIC_APP_ENV !== 'production'
}

export const specialsManagementProcedure = publicProcedure.use(
  async ({ next, ctx }) => {
    if (!canManageSpecials(ctx?.session?.user))
      throw new TRPCError({ code: 'FORBIDDEN' })
    return next()
  },
)

export const specialContestRouter = createTRPCRouter({
  canManage: publicProcedure.query(({ ctx }) =>
    canManageSpecials(ctx.session?.user),
  ),
  create: specialsManagementProcedure
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
