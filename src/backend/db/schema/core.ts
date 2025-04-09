import { sql } from 'drizzle-orm'
import { timestamp } from 'drizzle-orm/pg-core'

export const createdUpdatedAtColumns = {
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
}
