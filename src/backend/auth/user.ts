import { and, eq, getTableColumns } from 'drizzle-orm'
import { db } from '../db'
import { accountTable, userTable, type UserSchema } from '../db/schema'

export async function createUser(email: string): Promise<UserSchema> {
  const [user] = await db
    .insert(userTable)
    .values({ email })
    .returning(getTableColumns(userTable))

  if (!user) {
    throw new Error('[AUTH] user creation failed')
  }

  return user
}

export async function getUserFromEmail(
  email: string,
): Promise<UserSchema | null> {
  const [user] = await db
    .select(getTableColumns(userTable))
    .from(userTable)
    .where(and(eq(userTable.email, email)))
  return user ?? null
}

export async function getUserAccount(user: UserSchema, provider: 'google') {
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

export async function createUserAccount(
  params: typeof accountTable.$inferInsert,
) {
  const [account] = await db
    .insert(accountTable)
    .values([params])
    .returning(getTableColumns(accountTable))

  return account
}
