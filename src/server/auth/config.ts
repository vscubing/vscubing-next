import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type DefaultSession, type NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { db } from '@/server/db'
import {
  accountTable,
  sessionTable,
  userTable,
  verificationTokenTable,
} from '@/server/db/schema'
import { env } from '@/env'
import type { Adapter, AdapterUser } from 'next-auth/adapters'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      finishedRegistration?: boolean
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

function customCreateUser(adapter: ReturnType<typeof DrizzleAdapter>): Adapter {
  // Overwrite createUser method on adapter
  adapter.createUser = async (data): Promise<AdapterUser> => {
    const dataEntered = await db
      .insert(userTable)
      .values({ ...data, name: '' })
      .returning()
      .then((res) => res[0] ?? null)

    if (!dataEntered) {
      throw new Error('User Creation Failed')
    }

    return dataEntered
  }

  return {
    ...adapter,
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: customCreateUser(
    DrizzleAdapter(db, {
      usersTable: userTable,
      accountsTable: accountTable,
      sessionsTable: sessionTable,
      verificationTokensTable: verificationTokenTable,
    }),
  ),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        finishedRegistration: (user as typeof userTable.$inferSelect)
          .finishedRegistration,
      },
    }),
  },
  events: {
    async createUser(user) {
      console.log('user registered', user)
    },
  },
} satisfies NextAuthConfig
