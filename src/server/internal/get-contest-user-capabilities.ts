import type { Discipline } from '@/types'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import {
  contestTable,
  contestDisciplineTable,
  roundSessionTable,
  userTable,
} from '@/server/db/schema'
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
    .innerJoin(
      contestDisciplineTable,
      eq(contestDisciplineTable.contestSlug, contestTable.slug),
    )
    .where(
      and(
        eq(contestTable.slug, contestSlug),
        eq(contestDisciplineTable.disciplineSlug, discipline),
      ),
    )

  if (!contest) return 'CONTEST_NOT_FOUND'
  if (!contest.isOngoing) return 'VIEW_RESULTS'

  const session = await auth()
  if (!session) return 'UNAUTHORIZED'

  const [ownSession] = await db
    .select({ isFinished: roundSessionTable.isFinished })
    .from(contestDisciplineTable)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.contestDisciplineId, contestDisciplineTable.id),
    )
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(contestDisciplineTable.contestSlug, contestSlug),
        eq(contestDisciplineTable.disciplineSlug, discipline),
        eq(userTable.id, session.user.id),
      ),
    )

  return ownSession?.isFinished ? 'VIEW_RESULTS' : 'SOLVE'
}
