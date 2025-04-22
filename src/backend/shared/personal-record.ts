import type { Discipline } from '@/types'
import type { db } from '../db'
import { eq, and, or, getTableColumns } from 'drizzle-orm'
import {
  userTable,
  solveTable,
  roundSessionTable,
  roundTable,
  contestTable,
} from '../db/schema'

export function getPersonalRecordSolveSubquery({
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
        eq(roundTable.disciplineSlug, discipline),
        or(
          eq(solveTable.status, 'submitted'),
          includeOngoing ? eq(solveTable.status, 'pending') : undefined,
        ),
        includeOngoing ? undefined : eq(contestTable.isOngoing, false),
      ),
    )
    .orderBy(userTable.id, solveTable.isDnf, solveTable.timeMs)
    .as('personal_best_solve_subquery')
}

export function getPersonalRecordSessionSubquery({
  db: _db,
  discipline,
  includeOngoing,
}: {
  db: typeof db
  discipline: Discipline
  includeOngoing: boolean
}) {
  return _db
    .selectDistinctOn([userTable.id], getTableColumns(roundSessionTable))
    .from(roundSessionTable)
    .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
    .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
    .innerJoin(userTable, eq(userTable.id, roundSessionTable.contestantId))
    .where(
      and(
        eq(roundTable.disciplineSlug, discipline),
        eq(roundSessionTable.isFinished, true),
        includeOngoing ? undefined : eq(contestTable.isOngoing, false),
      ),
    )
    .orderBy(userTable.id, roundSessionTable.isDnf, roundSessionTable.avgMs)
    .as('personal_best_session_subquery')
}
