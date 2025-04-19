import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import {
  roundTable,
  roundSessionTable,
  contestTable,
  solveTable,
} from '../db/schema'

export const averageRecordSubquery = db // NOTE: we can't join userTable here because drizzle fails to disambiguate `id` columns
  .selectDistinctOn([roundTable.disciplineSlug])
  .from(roundSessionTable)
  .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
  .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
  .where(
    and(
      eq(roundSessionTable.isFinished, true),
      eq(contestTable.isOngoing, false), // TODO: remove this when we make leaderboards update immediately and not after a contest ends
    ),
  )
  .orderBy(
    roundTable.disciplineSlug,
    roundSessionTable.isDnf,
    roundSessionTable.avgMs,
  )
  .as('average_record_subquery')

export const singleRecordSubquery = db // NOTE: we can't join userTable here because drizzle fails to disambiguate `id` columns
  .selectDistinctOn([roundTable.disciplineSlug])
  .from(solveTable)
  .innerJoin(
    roundSessionTable,
    eq(roundSessionTable.id, solveTable.roundSessionId),
  )
  .innerJoin(roundTable, eq(roundTable.id, roundSessionTable.roundId))
  .innerJoin(contestTable, eq(contestTable.slug, roundTable.contestSlug))
  .where(
    and(
      eq(solveTable.status, 'submitted'),
      eq(contestTable.isOngoing, false), // TODO: remove this when we make leaderboards update immediately and not after a contest ends
    ),
  )
  .orderBy(roundTable.disciplineSlug, solveTable.isDnf, solveTable.timeMs)
  .as('single_record_subquery')
