import { sql } from 'drizzle-orm'
import { index, pgTable } from 'drizzle-orm/pg-core'
import { usersTable } from './accounts'
import { DISCIPLINES } from '@/shared'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

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
  slug: d.text({ enum: DISCIPLINES }).primaryKey(),
}))

export const contestsTable = pgTable('contest', (d) => ({
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

export * from './accounts'
