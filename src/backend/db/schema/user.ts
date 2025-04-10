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
      .references(() => userTable.id, { onDelete: 'cascade' }),
    animationDuration: d.integer('animation_duration').notNull().default(100),
    inspectionVoiceAlert: d
      .text('inspection_voice_alert')
      .$type<'Male' | 'Female' | 'None'>()
      .notNull()
      .default('Male'),
    cameraPositionTheta: d
      .integer('camera_position_theta')
      .notNull()
      .default(0),
    cameraPositionPhi: d.integer('camera_position_phi').notNull().default(6),
  }),
)
