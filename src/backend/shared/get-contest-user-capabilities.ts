import type { Discipline } from '@/types'
import { auth } from '@/backend/auth'
import { db } from '@/backend/db'
import {
  contestTable,
  roundTable,
  roundSessionTable,
  userTable,
} from '@/backend/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getContestUserCapabilities({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}): Promise<'CONTEST_NOT_FOUND' | 'SOLVE' | 'VIEW_RESULTS' | 'UNAUTHORIZED'> {
  const [contest] = await db
    .select({ isOngoing: contestTable.isOngoing })
    .from(contestTable)
    .innerJoin(roundTable, eq(roundTable.contestSlug, contestTable.slug))
    .where(
      and(
        eq(contestTable.slug, contestSlug),
        eq(roundTable.disciplineSlug, discipline),
      ),
    )

  if (!contest) return 'CONTEST_NOT_FOUND'
  if (!contest.isOngoing) return 'VIEW_RESULTS'

  const session = await auth()
  if (!session) return 'UNAUTHORIZED'

  const [ownSession] = await db
    .select({ isFinished: roundSessionTable.isFinished })
    .from(roundTable)
    .innerJoin(roundSessionTable, eq(roundSessionTable.roundId, roundTable.id))
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(roundTable.contestSlug, contestSlug),
        eq(roundTable.disciplineSlug, discipline),
        eq(userTable.id, session.user.id),
      ),
    )

  return ownSession?.isFinished ? 'VIEW_RESULTS' : 'SOLVE'
}
