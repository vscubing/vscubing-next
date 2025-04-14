import { relations, type InferSelectModel } from 'drizzle-orm'
import { index, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { createdUpdatedAtColumns } from './core'

export const userTable = pgTable('user', (d) => ({
  ...createdUpdatedAtColumns,
  id: d
    .varchar('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // NOTE: legacy userId's are just integers
  name: d.varchar('name', { length: 255 }).notNull().default(''),
  email: d.varchar('email', { length: 255 }).notNull(),
  finishedRegistration: d
    .boolean('finished_registration')
    .default(false)
    .notNull(),
  role: d.text().$type<'admin'>(),
}))

export const userRelations = relations(userTable, ({ many }) => ({
  accounts: many(accountTable),
}))

export const accountTable = pgTable(
  'account',
  (d) => ({
    ...createdUpdatedAtColumns,
    userId: d
      .varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    provider: d
      .varchar('provider', { length: 255 })
      .notNull()
      .$type<'google' | 'wca'>(),
    providerAccountId: d
      .varchar('provider_account_id', { length: 255 })
      .notNull(),
    refresh_token: d.text('refresh_token'),
    access_token: d.text('access_token'),
    expires_at: d.bigint('expires_at', { mode: 'bigint' }),
    token_type: d.varchar('token_type', { length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index('account_user_id_idx').on(t.userId),
  ],
)

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}))

export const authSessionTable = pgTable(
  'auth_session',
  (d) => ({
    id: d.varchar('id', { length: 255 }).primaryKey(),
    userId: d
      .varchar('user_id', { length: 255 })
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    expiresAt: d
      .timestamp('expires_at', { mode: 'date', withTimezone: true })
      .notNull(),
  }),
  (t) => [index('t_user_id_idx').on(t.userId)],
)

export const authSessionRelations = relations(authSessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authSessionTable.userId],
    references: [userTable.id],
  }),
}))

export type User = InferSelectModel<typeof userTable>
export type Session = InferSelectModel<typeof authSessionTable>
