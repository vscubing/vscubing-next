import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/backend/api/trpc'
import { accountTable, userTable } from '@/backend/db/schema'
import { and, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  deleteSessionTokenCookie,
  invalidateSession,
} from '@/backend/auth/session'

const USERNAME_LENGTH = { MIN: 3, MAX: 24 }
export const userRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx: { session } }) => {
    if (!session) return null
    return session.user
  }),
  logout: protectedProcedure.mutation(async ({ ctx: { session } }) => {
    await invalidateSession(session.id)
    await deleteSessionTokenCookie()
  }),
  setUsername: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .trim()
          .min(1, 'It looks like you forgot to enter a nickname')
          .regex(
            /^[a-zA-Z0-9_.-]*$/,
            'Oops! Nicknames can only contain letters, numbers, underscores and hyphens. Please remove any special characters or spaces',
          )
          .min(
            USERNAME_LENGTH.MIN,
            `Uh-oh! Your nickname should be between ${USERNAME_LENGTH.MIN} and ${USERNAME_LENGTH.MAX} characters. Let's tweak it to fit the rules`,
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user
      if (user.finishedRegistration)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Changing the username is not possible',
        })
      const conflict = await ctx.db
        .select()
        .from(userTable)
        .where(eq(userTable.name, input.username))
        .then((res) => res.length > 0)

      if (conflict)
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            'Sorry, that nickname is already taken! How about trying a unique variation or adding some numbers?',
          cause: 'CUSTOM',
        })

      await ctx.db
        .update(userTable)
        .set({ name: input.username, finishedRegistration: true })
        .where(eq(userTable.id, user.id))
    }),
  removeWcaAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const wcaId = ctx.session.user.wcaId
    if (!wcaId) throw new TRPCError({ code: 'PRECONDITION_FAILED' })

    await ctx.db
      .delete(accountTable)
      .where(
        and(
          eq(accountTable.provider, 'wca'),
          eq(accountTable.providerAccountId, wcaId),
        ),
      )
  }),
})
