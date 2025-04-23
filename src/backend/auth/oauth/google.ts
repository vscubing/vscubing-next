import { env } from '@/env'
import { Google } from 'arctic'

export const googleOauthClient = new Google(
  env.AUTH_GOOGLE_CLIENT_ID,
  env.AUTH_GOOGLE_CLIENT_SECRET,
  env.AUTH_GOOGLE_URL,
)
