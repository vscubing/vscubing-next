import type { Move } from './move-types'
import type { ExperimentalBinary3x3x3Pattern } from '@vscubing/cubing/protocol'
import { type Socket } from 'socket.io-client'
import type {
  CreateRoomOptions,
  RoomSettings,
  PartialRoomSettings,
  JoinRoomPayload,
  KickUserPayload,
  OnMovePayload,
} from './schemas'

// Re-export schema types
export type {
  CreateRoomOptions,
  RoomSettings,
  PartialRoomSettings,
  JoinRoomPayload,
  KickUserPayload,
  OnMovePayload,
}

// Room types
export type RoomUser = {
  odol: string // unique ID: odol ID for logged-in, socket ID for guests
  displayName: string // username or "GuestXXX"
  isAuthenticated: boolean
  socketId: string
}

export type RoomUserInfo = Omit<RoomUser, 'socketId'>

export type RoomInfo = {
  id: string
  name: string
  ownerId: string
  userCount: number
  hasPassword: boolean
}

export type RoomState = {
  id: string
  name: string
  ownerId: string
  users: RoomUserInfo[]
  hasPassword: boolean
}

// Optimistic sync types
export type MoveConfirmed = {
  serverMoveId: number
  move: Move
  originClientId: string
  clientMoveId: number
}

export type PatternSync = {
  pattern: ExperimentalBinary3x3x3Pattern
  serverMoveId: number
}

// Socket events
export type ServerToClientEvents = {
  ready: () => void
  roomList: (rooms: RoomInfo[]) => void
  roomState: (state: RoomState) => void
  yourOdol: (odol: string) => void
  userJoined: (user: RoomUserInfo) => void
  userLeft: (odol: string) => void
  patternSync: (data: PatternSync) => void
  moveConfirmed: (data: MoveConfirmed) => void
  kicked: () => void
  roomSettingsChanged: (settings: RoomSettings) => void
  error: (message: string) => void
}

export type JoinRoomResult =
  | { success: true; state: RoomState }
  | { success: false; error: string }

export type CreateRoomResult =
  | { success: true; roomId: string }
  | { success: false; error: string }

export type ClientToServerEvents = {
  getRoomList: () => void
  createRoom: (
    payload: CreateRoomOptions,
    callback?: (result: CreateRoomResult) => void,
  ) => void
  joinRoom: (
    payload: JoinRoomPayload,
    callback?: (result: JoinRoomResult) => void,
  ) => void
  leaveRoom: () => void
  onMove: (payload: OnMovePayload) => void
  kickUser: (payload: KickUserPayload) => void
  updateRoomSettings: (payload: PartialRoomSettings) => void
}

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>
