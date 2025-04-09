import { env } from '@/env'
import { Google } from 'arctic'
import { OAuth2Client } from 'oslo/oauth2'

export const googleOauthClient = new Google(
  env.AUTH_GOOGLE_CLIENT_ID,
  env.AUTH_GOOGLE_CLIENT_SECRET,
  env.AUTH_GOOGLE_URL,
)

export const wcaOauthClient = new OAuth2Client(
  env.AUTH_WCA_CLIENT_ID,
  'https://www.worldcubeassociation.org/oauth/authorize',
  'https://www.worldcubeassociation.org/oauth/token',
  { redirectURI: env.AUTH_WCA_URL },
)
