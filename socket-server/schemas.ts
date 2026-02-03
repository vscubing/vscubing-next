import { z } from 'zod'
import { moveSchema } from './move-types'

// Client-to-server event payload schemas
export const createRoomOptionsSchema = z.object({
  password: z.string().optional(),
})

export const joinRoomPayloadSchema = z.object({
  roomId: z.string(),
  password: z.string().optional(),
})

export const kickUserPayloadSchema = z.object({
  odol: z.string(),
})

export const onMovePayloadSchema = z.object({
  move: moveSchema,
})

// Room settings schema (for both input and output)
export const roomSettingsSchema = z.object({
  password: z.string().nullable(),
})

// Partial room settings for updates
export const partialRoomSettingsSchema = z.object({
  password: z.string().nullable().optional(),
})

// Derived types
export type CreateRoomOptions = z.infer<typeof createRoomOptionsSchema>
export type JoinRoomPayload = z.infer<typeof joinRoomPayloadSchema>
export type KickUserPayload = z.infer<typeof kickUserPayloadSchema>
export type OnMovePayload = z.infer<typeof onMovePayloadSchema>
export type RoomSettings = z.infer<typeof roomSettingsSchema>
export type PartialRoomSettings = z.infer<typeof partialRoomSettingsSchema>
