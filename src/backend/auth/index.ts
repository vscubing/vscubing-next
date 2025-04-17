import { cache } from 'react'
import { env } from '@/env'
import { getCurrentSession } from './session'

export const auth = cache(async () => {
  if (env.DEV_ARTIFICIAL_DELAY === 'ENABLED') {
    const waitMs = Math.floor(Math.random() * 400) + 500
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  return getCurrentSession()
})
