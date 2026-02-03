export type AuthUser = {
  id: string
  name: string
}

const NEXTJS_URL = process.env.NEXTJS_URL ?? 'http://localhost:3000'

export async function validateSession(
  sessionToken: string | undefined,
): Promise<AuthUser | null> {
  if (!sessionToken) return null

  try {
    const response = await fetch(`${NEXTJS_URL}/api/socket-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken }),
    })

    if (!response.ok) return null

    const data = (await response.json()) as AuthUser
    return data
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

export function parseSessionFromCookie(
  cookieHeader: string | undefined,
): string | undefined {
  if (!cookieHeader) return undefined

  const cookies = cookieHeader.split(';').map((c) => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'session') {
      return value
    }
  }
  return undefined
}

export function generateGuestName(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `Guest${num}`
}
