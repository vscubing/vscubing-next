import { cookies } from 'next/headers'
import { wcaOauthClient } from '@/backend/auth/oauth'
import { z } from 'zod'
import { createUserAccount } from '@/backend/auth/user'
import { auth } from '@/backend/auth'
import { tryCatch } from '@/utils/try-catch'
import { env } from '@/env'

// TODO: redirect back on error
// TODO: conflict handling
export async function GET(request: Request): Promise<Response> {
  const session = await auth()
  if (!session)
    return new Response(null, {
      status: 401,
    })

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const storedState = cookieStore.get('wca_oauth_state')?.value ?? null
  const codeVerifier = cookieStore.get('wca_code_verifier')?.value ?? null
  const redirectTo = cookieStore.get('wca_redirect_to')?.value ?? '/'
  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response(null, {
      status: 400,
    })
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    })
  }

  const { data: tokenRaw, error: tokenError } = await tryCatch(
    wcaOauthClient.validateAuthorizationCode(code, {
      credentials: env.AUTH_WCA_CLIENT_SECRET,
    }) as Promise<unknown>,
  )
  if (tokenError) {
    console.error('[WCA] invalid token schema: ', tokenError)
    return new Response(null, {
      status: 400,
    })
  }

  const token = tokenSchema.parse(tokenRaw)

  const { me: claims } = await fetch(
    'https://www.worldcubeassociation.org/api/v0/me',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token.access_token}` },
    },
  )
    .then((res) => res.json())
    .then((json) => meSchema.parse(json))

  await createUserAccount({
    userId: session.user.id,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: BigInt(token.created_at) + BigInt(token.expires_in),
    provider: 'wca',
    providerAccountId: claims.wca_id,
  })

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
    },
  })
}

// const countrySchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   continentId: z.string(),
//   iso2: z.string(),
// })

// const avatarSchema = z.object({
//   id: z.number(),
//   status: z.string(),
//   thumbnail_crop_x: z.number().nullable(),
//   thumbnail_crop_y: z.number().nullable(),
//   thumbnail_crop_w: z.number().nullable(),
//   thumbnail_crop_h: z.number().nullable(),
//   url: z.string().url(),
//   thumb_url: z.string().url(),
//   is_default: z.boolean(),
//   can_edit_thumbnail: z.boolean(),
// })

const meSchema = z.object({
  me: z.object({
    // id: z.number(),
    // created_at: z.string().datetime(),
    // updated_at: z.string().datetime(),
    // name: z.string(),
    wca_id: z.string(),
    // gender: z.string(),
    // // country_iso2: z.string(),
    // url: z.string().url(),
    // country: countrySchema,
    // delegate_status: z.string().nullable(),
    // class: z.string(),
    // teams: z.array(z.any()), // Can be replaced with a stricter type if teams structure is known
    // avatar: avatarSchema,
  }),
})

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'), // since it's always "Bearer"
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
  created_at: z.number(), // Unix timestamp
})
