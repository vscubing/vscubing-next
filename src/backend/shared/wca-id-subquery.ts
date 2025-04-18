import { eq } from 'drizzle-orm'
import type { db } from '../db'
import { accountTable, userTable } from '../db/schema'

export function getWcaIdSubquery({ db: _db }: { db: typeof db }) {
  return _db
    .select({ wcaId: accountTable.providerAccountId, userId: userTable.id })
    .from(accountTable)
    .innerJoin(userTable, eq(userTable.id, accountTable.userId))
    .where(eq(accountTable.provider, 'wca'))
    .as('wca_id_subquery')
}
