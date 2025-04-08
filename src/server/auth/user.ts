import { and, eq, getTableColumns } from 'drizzle-orm'
import { db } from '../db'
import { accountTable, userTable, type User } from '../db/schema'

export async function createUser(email: string): Promise<User> {
  const [user] = await db
    .insert(userTable)
    .values({ email })
    .returning(getTableColumns(userTable))

  if (!user) {
    throw new Error('[AUTH] user creation failed')
  }

  return user
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select(getTableColumns(userTable))
    .from(userTable)
    .where(and(eq(userTable.email, email)))
  return user ?? null
}

export async function getUserAccount(user: User, provider: 'google') {
  const [account] = await db
    .select()
    .from(accountTable)
    .where(
      and(
        eq(accountTable.userId, user.id),
        eq(accountTable.provider, provider),
      ),
    )

  return account ?? null
}

export async function createUserAccount(params: {
  provider: 'google' | 'wca'
  providerAccountId: string
  userId: string
  refresh_token: string
  access_token: string
  expires_at: number
}) {
  const [account] = await db
    .insert(accountTable)
    .values([params])
    .returning(getTableColumns(accountTable))

  return account
}
