import type { Discipline } from '@/types'
import type { db } from '../db'
import { eq, and, isNotNull } from 'drizzle-orm'
import {
  userTable,
  solveTable,
  roundSessionTable,
  roundTable,
  contestTable,
} from '../db/schema'

export function getPersonalBestSubquery(
  _db: typeof db,
  discipline: Discipline,
) {
  return _db
    .selectDistinctOn([userTable.id], {
      id: solveTable.id,
    })
    .from(solveTable)
    .innerJoin(
      roundSessionTable,
      eq(roundSessionTable.id, solveTable.roundSessionId),
    )
    .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
    .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(solveTable.isDnf, false),
        eq(solveTable.status, 'submitted'),
        isNotNull(solveTable.timeMs),
        eq(roundTable.disciplineSlug, discipline),
        eq(contestTable.isOngoing, false),
      ),
    )
    .orderBy(userTable.id, solveTable.timeMs)
    .as('sq')
}
