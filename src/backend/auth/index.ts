import { cache } from 'react'
import { env } from '@/env'
import { getCurrentSession } from './session'

export const auth = cache(async () => {
  if (env.NEXT_PUBLIC_APP_ENV === 'development') {
    // // artificial delay in dev
    // const waitMs = Math.floor(Math.random() * 400) + 100
    // await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  return getCurrentSession()
})
