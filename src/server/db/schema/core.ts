import { sql } from 'drizzle-orm'
import { timestamp } from 'drizzle-orm/pg-core'

export const createdUpdatedAtColumns = {
  createdAt: timestamp({
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp({
    withTimezone: true,
    mode: 'string',
  })
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
}
