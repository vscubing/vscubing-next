import { pgTable } from 'drizzle-orm/pg-core'
import { createdUpdatedAtColumns } from './core'
import { userTable } from './account'
import type { TwistySimulatorColorscheme } from 'vendor/cstimer/types'
import type { FieldsNonNullable } from '@/lib/utils/set-optional'

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
    colorscheme: d.json().$type<TwistySimulatorColorscheme>(), // I don't want to set it for everyone in the db, including users that don't need it, so it's nullable, maybe I'll eventually make other columns here nullable too
    puzzleScale: d.doublePrecision('puzzle_scale').notNull().default(1),
  }),
)

export const userMetadataTable = pgTable('user_metadata', (d) => ({
  ...createdUpdatedAtColumns,
  id: d.integer('id').primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .unique(),
  seenSportcubingAd: d.boolean(),
  seenDiscordInvite: d.boolean(),
  suspended: d.boolean('suspended'),
}))
export type UserMetadata = FieldsNonNullable<
  Omit<
    typeof userMetadataTable.$inferSelect,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
  >
>
export const USER_METADATA_DEFAULTS: UserMetadata = {
  seenDiscordInvite: false,
  seenSportcubingAd: false,
  suspended: false,
}
