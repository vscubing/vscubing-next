import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { usersTable } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

const USERNAME_LENGTH = { MIN: 3, MAX: 24 }
export const userRouter = createTRPCRouter({
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
      if (user.isVerified)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Changing the username is not possible',
        })
      const conflict = await ctx.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.name, input.username))
        .then((res) => res.length > 0)

      if (conflict)
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            'Sorry, that nickname is already taken! How about trying a unique variation or adding some numbers?',
          cause: 'CUSTOM',
        })

      await ctx.db
        .update(usersTable)
        .set({ name: input.username, isVerified: true })
        .where(eq(usersTable.id, user.id))
    }),
})
