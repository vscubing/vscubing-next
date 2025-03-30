import type { Discipline } from '@/app/_types'
import { DISCIPLINES } from '@/shared'
import { sql } from 'drizzle-orm'
import { pgTable, pgEnum } from 'drizzle-orm/pg-core'
import { userTable } from './account'
import { createdUpdatedAtColumns } from './core'

export const disciplineTable = pgTable('discipline', (d) => ({
  ...createdUpdatedAtColumns,
  slug: d.text('slug', { enum: DISCIPLINES }).primaryKey(),
}))

export const contestTable = pgTable('contest', (d) => ({
  ...createdUpdatedAtColumns,
  slug: d.text('slug').notNull().primaryKey().unique(), // index this?
  startDate: d
    .timestamp('start_date', {
      withTimezone: true,
      mode: 'string',
    })
    .notNull(),
  endDate: d.timestamp('end_date', { withTimezone: true, mode: 'string' }),
  isOngoing: d.boolean('is_ongoing').notNull(),
}))

export const contestDisciplineTable = pgTable('contest_discipline', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
  contestSlug: d
    .text('contest_slug')
    .notNull()
    .references(() => contestTable.slug, { onDelete: 'cascade' }),
  disciplineSlug: d
    .text('discipline_slug')
    .notNull()
    .references(() => disciplineTable.slug, { onDelete: 'cascade' })
    .$type<Discipline>(),
}))

export const scramblePositionEnum = pgEnum('scramble_position', [
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
  id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
  contestDisciplineId: d
    .integer('contest_discipline_id')
    .notNull()
    .references(() => contestDisciplineTable.id, { onDelete: 'cascade' }),
  position: scramblePositionEnum('position').notNull(),
  isExtra: d
    .boolean('is_extra')
    .generatedAlwaysAs(
      sql<boolean>`CASE WHEN position IN ('E1', 'E2') THEN TRUE ELSE FALSE END`,
    )
    .notNull(),
  moves: d.text('moves'),
}))

export const roundSessionTable = pgTable('round_session', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
  contestantId: d
    .text('contestant_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  contestDisciplineId: d
    .integer('contest_discipline_id')
    .notNull()
    .references(() => contestDisciplineTable.id, { onDelete: 'cascade' }),
  avgMs: d.integer('avg_ms'),
  isDnf: d.boolean('is_dnf'),
  isFinished: d.boolean('is_finished').notNull(),
}))

export const solveStateEnum = pgEnum('solve_state', [
  'pending',
  'submitted',
  'changed_to_extra',
])
export const solveTable = pgTable('solve', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
  scrambleId: d
    .integer('scramble_id')
    .notNull()
    .references(() => scrambleTable.id, { onDelete: 'cascade' }),
  roundSessionId: d
    .integer('round_session_id')
    .notNull()
    .references(() => roundSessionTable.id, { onDelete: 'cascade' }),
  state: solveStateEnum('state').notNull().default('pending'),
  timeMs: d.integer('time_ms'),
  isDnf: d.boolean('is_dnf').notNull(),
  reconstruction: d.varchar('solution', { length: 10000 }), // TODO: rename reconstruction field to solution
}))
