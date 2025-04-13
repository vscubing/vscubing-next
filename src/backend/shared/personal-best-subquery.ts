import type { Discipline } from '@/types'
import type { db } from '../db'
import { eq, and, isNotNull, or, getTableColumns } from 'drizzle-orm'
import {
  userTable,
  solveTable,
  roundSessionTable,
  roundTable,
  contestTable,
} from '../db/schema'

export function getPersonalBestSubquery({
  db: _db,
  discipline,
  includeOngoing,
}: {
  db: typeof db
  discipline: Discipline
  includeOngoing: boolean
}) {
  return _db
    .selectDistinctOn([userTable.id], getTableColumns(solveTable))
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
        includeOngoing
          ? or(
              eq(solveTable.status, 'submitted'),
              eq(solveTable.status, 'pending'),
            )
          : eq(solveTable.status, 'submitted'),
        isNotNull(solveTable.timeMs),
        eq(roundTable.disciplineSlug, discipline),
        includeOngoing ? undefined : eq(contestTable.isOngoing, false),
      ),
    )
    .orderBy(userTable.id, solveTable.timeMs)
    .as('personal_best_subquery')
}
