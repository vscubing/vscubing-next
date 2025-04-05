import { pgTable } from 'drizzle-orm/pg-core'
import { createdUpdatedAtColumns } from './core'
import { userTable } from './account'

export const userSimulatorSettingsTable = pgTable(
  'user_simulator_settings',
  (d) => ({
    ...createdUpdatedAtColumns,
    id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }), // TODO: proper strict 1-to-1 relation
    animationDuration: d.integer().notNull().default(100),
    inspectionVoiceAlert: d
      .text()
      .$type<'Male' | 'Female' | 'None'>()
      .notNull()
      .default('Male'),
    cameraPositionTheta: d.integer().notNull().default(0),
    cameraPositionPhi: d.integer().notNull().default(6),
  }),
)
