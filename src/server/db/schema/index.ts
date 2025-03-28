import { sql } from 'drizzle-orm'
import { index, pgEnum, pgTable } from 'drizzle-orm/pg-core'
import { usersTable } from './accounts'
import { DISCIPLINES } from '@/shared'
import { createdUpdatedAtColumns } from './core'

export * from './accounts'

export const postsTable = pgTable(
  'post',
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => usersTable.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index('created_by_idx').on(t.createdById),
    index('name_idx').on(t.name),
  ],
)

export const disciplinesTable = pgTable('discipline', (d) => ({
  ...createdUpdatedAtColumns,
  slug: d.text({ enum: DISCIPLINES }).primaryKey(),
}))

export const contestsTable = pgTable('contest', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  slug: d.text().notNull().unique(),
  startDate: d
    .timestamp({
      withTimezone: true,
      mode: 'string',
    })
    .notNull(),
  endDate: d.timestamp({ withTimezone: true, mode: 'string' }),
  isOngoing: d.boolean().notNull(),
}))

export const contestsToDisciplinesTable = pgTable(
  'contest_discipline',
  (d) => ({
    ...createdUpdatedAtColumns,
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    contestId: d
      .integer()
      .notNull()
      .references(() => contestsTable.id, { onDelete: 'cascade' }),
    disciplineSlug: d
      .text()
      .notNull()
      .references(() => disciplinesTable.slug, { onDelete: 'cascade' }),
  }),
)

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
    .references(() => contestsToDisciplinesTable.id, { onDelete: 'cascade' }),
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
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  contestDisciplineId: d
    .integer()
    .notNull()
    .references(() => contestsToDisciplinesTable.id, { onDelete: 'cascade' }),
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
