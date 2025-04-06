import NextAuth from 'next-auth'
import { cache } from 'react'

import { authConfig } from './config'
import { env } from '@/env'

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig)

const auth = cache(async () => {
  if (env.NODE_ENV === 'development') {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  return uncachedAuth()
})

export { auth, handlers, signIn, signOut }
