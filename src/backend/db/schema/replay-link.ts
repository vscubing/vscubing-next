import { pgTable } from 'drizzle-orm/pg-core'
import { createdUpdatedAtColumns } from './core'
import { userTable } from './account'

export const replayLinkTable = pgTable('replay_link', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.text('id').primaryKey(),
  discipline: d.text('discipline').notNull(),
  scramble: d.text('scramble').notNull(),
  solution: d.varchar('solution', { length: 500000 }).notNull(),
  timeMs: d.integer('time_ms').notNull(),
  username: d.text('username'),
  date: d.bigint('date', { mode: 'number' }),
  createdById: d
    .varchar('created_by_id', { length: 255 })
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
}))
