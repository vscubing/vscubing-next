import { db } from '@/server/db'
import { contestsTable } from '@/server/db/schema'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

export default async function Page() {
  const ongoingList = await db
    .select()
    .from(contestsTable)
    .where(eq(contestsTable.isOngoing, true))

  if (!ongoingList || ongoingList.length === 0)
    throw new Error('No ongoing contest!')
  if (ongoingList.length > 1) throw new Error('More then one ongoing contest!')

  redirect(`/contests/${ongoingList[0]!.slug}`)
}
