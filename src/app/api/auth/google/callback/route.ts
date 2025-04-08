import { cookies } from 'next/headers'
import { decodeIdToken } from 'arctic'

import { googleOauthClient } from '@/server/auth/oauth'
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/server/auth/session'
import {
  createUser,
  createUserAccount,
  getUserAccount,
  getUserFromEmail,
} from '@/server/auth/user'
import { tryCatch } from '@/app/_utils/try-catch'

// TODO: redirect back on error
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const storedState = cookieStore.get('google_oauth_state')?.value ?? null
  const codeVerifier = cookieStore.get('google_code_verifier')?.value ?? null
  const redirectTo = cookieStore.get('google_redirect_to')?.value ?? '/'
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

  const { data: tokens, error } = await tryCatch(
    googleOauthClient.validateAuthorizationCode(code, codeVerifier),
  )
  if (error)
    return new Response(null, {
      status: 400,
    })

  const claims = decodeIdToken(tokens.idToken()) as {
    email: string
    sub: string
  }
  const { email, sub: googleUserId } = claims

  const existingUser = await getUserFromEmail(email)

  const user = existingUser ?? (await createUser(email))

  const existingAccount = await getUserAccount(user, 'google')
  if (existingAccount === null) {
    await createUserAccount({
      userId: user.id,
      provider: 'google',
      providerAccountId: googleUserId,
      access_token: tokens.accessToken(),
      refresh_token: tokens.refreshToken(),
      expires_at: tokens.accessTokenExpiresAt().getTime(),
    })
  }

  const sessionToken = generateSessionToken()
  const session = await createSession(sessionToken, user.id)
  await setSessionTokenCookie(sessionToken, session.expiresAt)

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
    },
  })
}
