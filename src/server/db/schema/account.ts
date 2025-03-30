import { relations } from 'drizzle-orm'
import { index, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { type AdapterAccount } from 'next-auth/adapters'
import { createdUpdatedAtColumns } from './core'

export const userTable = pgTable('user', (d) => ({
  ...createdUpdatedAtColumns,
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // NOTE: legacy userId's are just integers
  name: d.varchar({ length: 255 }).notNull(),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d.timestamp({ mode: 'date' }),
  image: d.text('image'),
  finishedRegistration: d.boolean().default(false).notNull(),
}))

export const userRelations = relations(userTable, ({ many }) => ({
  accounts: many(accountTable),
}))

export const accountTable = pgTable(
  'account',
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => userTable.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount['type']>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
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

export const sessionTable = pgTable(
  'session',
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => userTable.id),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [index('t_user_id_idx').on(t.userId)],
)

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}))

export const verificationTokenTable = pgTable(
  'verification_token',
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
)
