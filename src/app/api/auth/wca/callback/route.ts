import { cookies } from 'next/headers'
import {
  getWcaClaims,
  validateWcaAuthorizationCode,
} from '@/backend/auth/oauth/wca'
import { createUserAccount } from '@/backend/auth/user'
import { auth } from '@/backend/auth'
import { tryCatch } from '@/lib/utils/try-catch'
import { WCA_AUTH_SUCCESS_SEARCH_PARAM } from '../error-search-param'

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
  const redirectTo = new URL(cookieStore.get('wca_redirect_to')?.value ?? '/')

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null ||
    state !== storedState
  ) {
    console.error(
      '[WCA] bad code/state/storedState/codeVerifier: ',
      code,
      state,
      storedState,
      codeVerifier,
    )
    redirectTo.searchParams.append(WCA_AUTH_SUCCESS_SEARCH_PARAM, 'false')
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo.toString(),
      },
    })
  }

  const { data: token, error: tokenError } = await tryCatch(
    validateWcaAuthorizationCode(code),
  )
  if (tokenError) {
    console.error('[WCA] token validation error', tokenError)
    redirectTo.searchParams.append(WCA_AUTH_SUCCESS_SEARCH_PARAM, 'false')
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo.toString(),
      },
    })
  }

  const claims = await getWcaClaims({ access_token: token.access_token })

  await createUserAccount({
    userId: session.user.id,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: BigInt(token.created_at) + BigInt(token.expires_in),
    provider: 'wca',
    providerAccountId: claims.wca_id,
    email: claims.email,
  })

  redirectTo.searchParams.append(WCA_AUTH_SUCCESS_SEARCH_PARAM, 'true')
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo.toString(),
    },
  })
}
