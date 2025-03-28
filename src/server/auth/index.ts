import NextAuth from 'next-auth'
import { cache } from 'react'

import { authConfig } from './config'

const {
  auth: uncachedAuth,
  unstable_update: updateSession,
  handlers,
  signIn,
  signOut,
} = NextAuth(authConfig)

const auth = cache(uncachedAuth)

export { auth, updateSession, handlers, signIn, signOut }
