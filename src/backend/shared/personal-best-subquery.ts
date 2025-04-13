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

export function getPersonalBestSolveSubquery({
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
        includeOngoing
          ? or(
              eq(solveTable.status, 'submitted'),
              eq(solveTable.status, 'pending'),
            )
          : eq(solveTable.status, 'submitted'),
        includeOngoing ? undefined : eq(contestTable.isOngoing, false),
      ),
    )
    .orderBy(userTable.id, solveTable.timeMs)
    .as('personal_best_solve_subquery')
}

export function getPersonalBestSessionSubquery({
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
    .orderBy(userTable.id, roundSessionTable.avgMs)
    .as('personal_best_session_subquery')
}
