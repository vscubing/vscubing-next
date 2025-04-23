import { env } from '@/env'
import { createWcaAuthorizationURL } from '@/backend/auth/oauth/wca'
import { generateState, generateCodeVerifier } from 'arctic'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<Response> {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = await createWcaAuthorizationURL({
    state,
    codeVerifier,
  })

  const cookieStore = await cookies()
  cookieStore.set('wca_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: env.NEXT_PUBLIC_APP_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax',
  })
  cookieStore.set('wca_code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    secure: env.NEXT_PUBLIC_APP_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
    sameSite: 'lax',
  })

  const redirectTo = request.nextUrl.searchParams.get('redirectTo')
  if (redirectTo)
    cookieStore.set('wca_redirect_to', redirectTo, {
      path: '/',
      maxAge: 60 * 10,
      sameSite: 'lax',
    })

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  })
}
