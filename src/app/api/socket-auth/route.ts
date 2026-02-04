import { validateSessionToken } from '@/backend/auth/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string }
    const token = body.token

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const result = await validateSessionToken(token)

    if (!result) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    return NextResponse.json({
      id: result.user.id,
      name: result.user.name,
    })
  } catch (error) {
    console.error('Socket auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
