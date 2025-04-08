import { env } from '@/env'
import { Google } from 'arctic'

export const google = new Google(
  env.AUTH_GOOGLE_CLIENT_ID,
  env.AUTH_GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback',
)
