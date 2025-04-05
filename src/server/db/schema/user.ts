import { pgTable } from 'drizzle-orm/pg-core'
import { createdUpdatedAtColumns } from './core'

export const userTable = pgTable('user', (d) => ({
  ...createdUpdatedAtColumns,
  id: d
    .varchar('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // NOTE: legacy userId's are just integers
  name: d.varchar('name', { length: 255 }).notNull(),
  email: d.varchar('email', { length: 255 }).notNull(),
  emailVerified: d.timestamp('email_verified', { mode: 'date' }), // TODO: remove
  image: d.text('image'), // TODO: remove
  finishedRegistration: d
    .boolean('finished_registration')
    .default(false)
    .notNull(),
  simulatorSettings: d
    .integer('simulator_settings_id')
    .notNull()
    .references(() => userSimulatorSettingsTable.id),
}))

export const userSimulatorSettingsTable = pgTable(
  'user_simulator_settings',
  (d) => ({
    ...createdUpdatedAtColumns,
    id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
    // userId: d
    //   .text('user_id')
    //   .notNull()
    //   .references(() => userTable.id, { onDelete: 'cascade' }), // TODO: proper strict 1-to-1 relation
    animationDuration: d.integer().notNull().default(10),
    inspectionVoiceAlert: d
      .text()
      .$type<'Male' | 'Female' | 'None'>()
      .default('Male'),
    cameraPositionTheta: d.integer().notNull().default(0),
    cameraPositionPhi: d.integer().notNull().default(6),
  }),
)
