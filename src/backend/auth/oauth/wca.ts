import { env } from '@/env'
import { OAuth2Client } from 'oslo/oauth2'
import { z } from 'zod'

const WCA_TOKEN_ENDPOINT = 'https://www.worldcubeassociation.org/oauth/token'
const WCA_ME_ENDPOINT = 'https://www.worldcubeassociation.org/api/v0/me'
const WCA_SCOPES = ['public', 'email']

const wcaOauthClient = new OAuth2Client(
  env.AUTH_WCA_CLIENT_ID,
  'https://www.worldcubeassociation.org/oauth/authorize',
  WCA_TOKEN_ENDPOINT,
  { redirectURI: env.AUTH_WCA_URL },
)

export async function createWcaAuthorizationURL({
  state,
  codeVerifier,
}: {
  state: string
  codeVerifier: string
}) {
  return wcaOauthClient.createAuthorizationURL({
    state,
    codeVerifier,
    scopes: WCA_SCOPES,
  })
}

export async function validateWcaAuthorizationCode(code: string) {
  const raw = await wcaOauthClient.validateAuthorizationCode(code, {
    credentials: env.AUTH_WCA_CLIENT_SECRET,
  })
  return wcaTokenSchema.parse(raw)
}

export async function getWcaClaims({ access_token }: { access_token: string }) {
  const response = await fetch(WCA_ME_ENDPOINT, {
    method: 'GET',
    headers: { Authorization: `Bearer ${access_token}` },
  })
  const json = (await response.json()) as unknown
  const { data, error } = meSchema.safeParse(json)
  if (error) throw error
  return data.me
}

export async function refreshWcaToken({
  refresh_token,
}: {
  refresh_token: string
}) {
  const url = new URL(WCA_TOKEN_ENDPOINT)
  url.searchParams.append('grant_type', 'refresh_token')
  url.searchParams.append('refresh_token', refresh_token)
  url.searchParams.append('client_id', env.AUTH_WCA_CLIENT_ID)
  url.searchParams.append('client_secret', env.AUTH_WCA_CLIENT_SECRET)
  console.log('refreshing', url)
  const result = await fetch(url, {
    method: 'POST',
  })
    .then((res) => res.json())
    .then((json) => z.union([wcaTokenSchema, wcaErrorSchema]).parse(json))

  if ('error' in result) {
    throw new Error(`WCA oauth error: ${JSON.stringify(result)}`)
  }

  console.log(
    `refreshed a WCA access_token with refresh_token ${refresh_token}\nreceived: ${JSON.stringify(result)}`,
  )
  return result
}

const wcaErrorSchema = z.object({
  error: z.string(),
  error_description: z.string(),
})

const wcaTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
  created_at: z.number(),
})

const countrySchema = z.object({
  id: z.string(),
  name: z.string(),
  iso2: z.string(),
})
const avatarSchema = z.object({
  id: z.number().nullable(),
  status: z.string(),
  url: z.string().url(),
  thumb_url: z.string().url(),
  is_default: z.boolean(),
  can_edit_thumbnail: z.boolean(),
})
export const meSchema = z.object({
  me: z.object({
    name: z.string(),
    wca_id: z.string(),
    gender: z.string(),
    country: countrySchema,
    delegate_status: z.string().nullable(),
    avatar: avatarSchema,
    email: z.string().email(),
  }),
})
