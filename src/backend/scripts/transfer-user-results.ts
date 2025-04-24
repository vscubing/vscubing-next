import { db } from '@/backend/db'
import { roundSessionTable, userTable } from '@/backend/db/schema'
import {
  and,
  eq,
  not,
  exists,
  aliasedTable,
  getTableColumns,
} from 'drizzle-orm'

// NOTE: this isn't used anywhere for now, but we probably want to add it to the admin panel eventually

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function transferUserResults({
  sourceUserName,
  targetUserName,
}: {
  sourceUserName: string
  targetUserName: string
}) {
  const [sourceUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.name, sourceUserName))
  if (!sourceUser) throw new Error(`no source with name ${sourceUserName}`)
  const [targetUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.name, targetUserName))
  if (!targetUser) throw new Error(`no target with name ${targetUserName}`)

  const aliasedRoundSessionTable = aliasedTable(roundSessionTable, 'rs_outer')
  const merged = await db
    .update(aliasedRoundSessionTable)
    .set({ contestantId: targetUser.id })
    .where(
      and(
        eq(aliasedRoundSessionTable.contestantId, sourceUser.id),
        not(
          exists(
            db
              .select()
              .from(roundSessionTable)
              .where(
                and(
                  eq(
                    roundSessionTable.roundId,
                    aliasedRoundSessionTable.roundId,
                  ),
                  eq(roundSessionTable.contestantId, targetUser.id),
                ),
              ),
          ),
        ),
      ),
    )
    .returning(getTableColumns(aliasedRoundSessionTable))
  const mergedArr = Array.from(merged.values())

  console.log(`Merged ${mergedArr.length} results: `, mergedArr, '\n')

  const conflict = await db
    .select()
    .from(roundSessionTable)
    .where(eq(roundSessionTable.contestantId, sourceUser.id))

  console.log(`Couldn't merge ${conflict.length} results:`, conflict)
}
