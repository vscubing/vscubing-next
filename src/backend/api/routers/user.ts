import { z } from 'zod'

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/backend/api/trpc'
import { accountTable, userTable } from '@/backend/db/schema'
import { and, eq, getTableColumns } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  deleteSessionTokenCookie,
  invalidateSession,
} from '@/backend/auth/session'
import { getWcaClaims, refreshWcaToken } from '@/backend/auth/oauth/wca'
import { db } from '@/backend/db'
import * as cheerio from 'cheerio'
import { unstable_cacheLife } from 'next/cache'

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

  // NOTE: connecting a WCA account is done via `/api/auth/wca/callback`
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

  /**
   * @deprecated NOTE: some of the `refresh_token`'s are invalid in production so we are using unofficial WCA api for now
   */
  wcaData: publicProcedure
    .input(z.object({ wcaId: z.string() }))
    .query(async ({ input }) => {
      const [account] = await db
        .select(getTableColumns(accountTable))
        .from(accountTable)
        .where(
          and(
            eq(accountTable.providerAccountId, input.wcaId),
            eq(accountTable.provider, 'wca'),
          ),
        )
      if (!account) throw new TRPCError({ code: 'NOT_FOUND' })

      if (
        !account.expires_at ||
        !account.access_token ||
        !account.refresh_token
      )
        throw new Error(`bad db row for wca id ${account.providerAccountId}`)

      const SECOND_IN_MS = 1_000
      const stillValid = account.expires_at * BigInt(SECOND_IN_MS) > Date.now()
      if (stillValid)
        return getWcaClaims({ access_token: account.access_token })

      const refreshed = await refreshWcaToken({
        refresh_token: account.refresh_token,
      })

      await db
        .update(accountTable)
        .set({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: BigInt(refreshed.created_at + refreshed.expires_in),
          token_type: refreshed.token_type,
        })
        .where(eq(accountTable.providerAccountId, account.providerAccountId))

      return getWcaClaims({ access_token: refreshed.access_token })
    }),

  wcaAvatar: publicProcedure // TODO: we can fetch this from the unofficial WCA API if https://github.com/robiningelbrecht/wca-rest-api/issues/1 gets resolved
    .input(z.object({ wcaId: z.string() }))
    .query(async ({ input }) => {
      'use cache'
      unstable_cacheLife({
        stale: 60 * 5,
        revalidate: 60 * 60, // revalidate in background after 1 hour on new requests
        expire: Infinity,
      })

      const url = `https://www.worldcubeassociation.org/persons/${input.wcaId}`

      const res = await fetch(url)
      if (res.status === 400) throw new TRPCError({ code: 'NOT_FOUND' })
      if (!res.ok) {
        console.error(`Error fetching avatar for ${input.wcaId}:`, res)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      const html = await res.text()

      const $ = cheerio.load(html)
      const avatarSrc = $('img.avatar').attr('src')

      if (!avatarSrc) {
        console.error(`Error retrieving avatarSrc for ${input.wcaId}`)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      if (avatarSrc.includes('missing_avatar_thumb')) return null

      return new URL(avatarSrc, url).href
    }),
})
