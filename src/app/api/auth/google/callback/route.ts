import { cookies } from 'next/headers'
import { decodeIdToken } from 'arctic'

import type { OAuth2Tokens } from 'arctic'
import { google } from '@/server/auth/oauth'
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

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieStore = await cookies()
  const storedState = cookieStore.get('google_oauth_state')?.value ?? null
  const codeVerifier = cookieStore.get('google_code_verifier')?.value ?? null
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

  let tokens: OAuth2Tokens
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    })
  }
  const claims = decodeIdToken(tokens.idToken()) as {
    email: string
    sub: string
  }
  const { email, sub: googleUserId } = claims
  // TODO: store and refresh access token

  const existingUser = await getUserFromEmail(email)

  if (existingUser !== null) {
    const existingAccount = await getUserAccount(existingUser, 'google')
    if (existingAccount === null) {
      await createUserAccount(existingUser, 'google', googleUserId)
    }

    const sessionToken = generateSessionToken()
    const session = await createSession(sessionToken, existingUser.id)
    await setSessionTokenCookie(sessionToken, session.expiresAt)
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    })
  }

  const user = await createUser(email)
  await createUserAccount(user, 'google', googleUserId)

  const sessionToken = generateSessionToken()
  const session = await createSession(sessionToken, user.id)
  await setSessionTokenCookie(sessionToken, session.expiresAt)
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  })
}
