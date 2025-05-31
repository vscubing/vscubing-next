import { cookies } from 'next/headers'
import { decodeIdToken } from 'arctic'

import { googleOauthClient } from '@/backend/auth/oauth/google'
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/backend/auth/session'
import {
  createUser,
  createUserAccount,
  getUserAccount,
  getUserFromEmail,
} from '@/backend/auth/user'
import { tryCatch } from '@/lib/utils/try-catch'
import { GOOGLE_AUTH_ERROR_SEARCH_PARAM } from '../error-search-param'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const storedState = cookieStore.get('google_oauth_state')?.value ?? null
  const codeVerifier = cookieStore.get('google_code_verifier')?.value ?? null
  const redirectTo = new URL(
    cookieStore.get('google_redirect_to')?.value ?? '/',
  )

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null ||
    state !== storedState
  ) {
    console.error(
      '[GOOGLE AUTH] no code/state/storedState/codeVerifier: ',
      code,
      state,
      storedState,
      codeVerifier,
    )
    redirectTo.searchParams.append(GOOGLE_AUTH_ERROR_SEARCH_PARAM, 'true')
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo.toString(),
      },
    })
  }

  const { data: tokens, error } = await tryCatch(
    googleOauthClient.validateAuthorizationCode(code, codeVerifier),
  )
  if (error) {
    error.message = '[GOOGLE AUTH] ' + error.message
    console.error(error)
    redirectTo.searchParams.append(GOOGLE_AUTH_ERROR_SEARCH_PARAM, 'true')
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo.toString(),
      },
    })
  }
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
      expires_at: BigInt(tokens.accessTokenExpiresAt().getTime()),
      email,
    })
  }

  const sessionToken = generateSessionToken()
  const session = await createSession(sessionToken, user.id)
  await setSessionTokenCookie(sessionToken, session.expiresAt)

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo.toString(),
    },
  })
}
