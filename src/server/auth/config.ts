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
    } & DefaultSession['user']
  }

  interface User {
    // ...other properties
    finishedRegistration?: boolean
  }
}

function customCreateUser(adapter: ReturnType<typeof DrizzleAdapter>): Adapter {
  // Overwrite createUser method on adapter
  adapter.createUser = async ({ email }): Promise<AdapterUser> => {
    const dataEntered = await db
      .insert(userTable)
      .values({ email, name: '' })
      .returning()
      .then((res) => res[0] ?? null)

    if (!dataEntered) {
      throw new Error('[AUTH] user creation failed')
    }

    return { ...dataEntered, emailVerified: null } as AdapterUser
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
  ],
  adapter: customCreateUser(
    DrizzleAdapter(db, {
      // @ts-expect-error there is no other way to limit the scope of auth tables because the columns are hardcoded
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
        finishedRegistration: user.finishedRegistration,
      },
    }),
  },
  events: {
    async createUser(user) {
      console.log('[AUTH] user registered: ', user.user.email)
    },
  },
} satisfies NextAuthConfig
