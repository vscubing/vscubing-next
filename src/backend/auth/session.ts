import { db } from '../db'
import {
  type SessionSchema,
  authSessionTable,
  userTable,
} from '../db/schema/account'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import { eq, getTableColumns } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { env } from '@/env'
import type { SessionUser, User } from '@/types'
import { getWcaIdSubquery } from '../shared/wca-id-subquery'

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export async function createSession(
  token: string,
  userId: string,
): Promise<SessionSchema> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: SessionSchema = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }
  await db.insert(authSessionTable).values(session)
  return session
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

  const wcaIdSubquery = getWcaIdSubquery({ db })

  const [result] = await db

    .select({
      user: {
        ...getTableColumns(userTable),
        wcaId: wcaIdSubquery.wcaId,
      },
      session: authSessionTable,
    })
    .from(authSessionTable)
    .innerJoin(userTable, eq(authSessionTable.userId, userTable.id))
    .leftJoin(wcaIdSubquery, eq(wcaIdSubquery.userId, userTable.id))
    .where(eq(authSessionTable.id, sessionId))
  if (!result) {
    return null
  }
  const { user, session } = result

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(authSessionTable).where(eq(authSessionTable.id, session.id))
    return null
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(authSessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(authSessionTable.id, session.id))
  }
  return { session, user }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(authSessionTable).where(eq(authSessionTable.id, sessionId))
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.delete(authSessionTable).where(eq(authSessionTable.userId, userId))
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NEXT_PUBLIC_APP_ENV === 'production',
    expires: expiresAt,
    path: '/',
  })
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NEXT_PUBLIC_APP_ENV === 'production',
    maxAge: 0,
    path: '/',
  })
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value ?? null
    if (token === null) {
      return null
    }
    const result = await validateSessionToken(token)
    return result
  },
)

export type SessionValidationResult = {
  session: SessionSchema
  user: SessionUser
} | null
