import type { Discipline } from '@/app/_types'
import { DISCIPLINES } from '@/shared'
import { sql } from 'drizzle-orm'
import { pgTable, pgEnum } from 'drizzle-orm/pg-core'
import { userTable } from './account'
import { createdUpdatedAtColumns } from './core'

export const disciplineTable = pgTable('discipline', (d) => ({
  ...createdUpdatedAtColumns,
  slug: d.text({ enum: DISCIPLINES }).primaryKey(),
}))

export const contestTable = pgTable('contest', (d) => ({
  ...createdUpdatedAtColumns,
  slug: d.text().notNull().primaryKey().unique(), // index this?
  startDate: d
    .timestamp({
      withTimezone: true,
      mode: 'string',
    })
    .notNull(),
  endDate: d.timestamp({ withTimezone: true, mode: 'string' }),
  isOngoing: d.boolean().notNull(),
}))

export const contestDisciplineTable = pgTable('contest_discipline', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  contestSlug: d
    .text()
    .notNull()
    .references(() => contestTable.slug, { onDelete: 'cascade' }),
  disciplineSlug: d
    .text()
    .notNull()
    .references(() => disciplineTable.slug, { onDelete: 'cascade' })
    .$type<Discipline>(),
}))

export const scramblePositionEnum = pgEnum('scramblePosition', [
  '1',
  '2',
  '3',
  '4',
  '5',
  'E1',
  'E2',
])
export const scrambleTable = pgTable('scramble', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  contestDisciplineId: d
    .integer()
    .notNull()
    .references(() => contestDisciplineTable.id, { onDelete: 'cascade' }),
  position: scramblePositionEnum().notNull(),
  isExtra: d
    .boolean()
    .generatedAlwaysAs(
      sql<boolean>`CASE WHEN position IN ('E1', 'E2') THEN TRUE ELSE FALSE END`,
    )
    .notNull(),
  moves: d.text(),
}))

export const roundSessionTable = pgTable('roundSession', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  contestantId: d
    .text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  contestDisciplineId: d
    .integer()
    .notNull()
    .references(() => contestDisciplineTable.id, { onDelete: 'cascade' }),
  avgMs: d.integer(),
  isDnf: d.boolean(),
  isFinished: d.boolean().notNull(),
}))

export const solveStateEnum = pgEnum('solveState', [
  'pending',
  'submitted',
  'changed_to_extra',
])
export const solveTable = pgTable('solve', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  scrambleId: d
    .integer()
    .notNull()
    .references(() => scrambleTable.id, { onDelete: 'cascade' }),
  roundSessionId: d
    .integer()
    .notNull()
    .references(() => roundSessionTable.id, { onDelete: 'cascade' }),
  state: solveStateEnum().notNull().default('pending'),
  timeMs: d.integer(),
  isDnf: d.boolean().notNull(),
  reconstruction: d.varchar({ length: 10000 }),
}))
