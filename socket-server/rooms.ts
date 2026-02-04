import { puzzles } from '@vscubing/cubing/puzzles'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { v4 as uuidv4 } from 'uuid'
import type { RoomUser, RoomInfo, RoomSettings, RoomUserInfo } from './types'

export type Room = {
  id: string
  name: string
  ownerId: string
  password: string | null
  pattern: KPattern
  serverMoveId: number
  users: Map<string, RoomUser>
  createdAt: number
  lastActivityAt: number
  cleanupTimer: ReturnType<typeof setTimeout> | null
}

const CLEANUP_DELAY_MS = 5 * 60 * 1000 // 5 minutes

export class RoomManager {
  private rooms = new Map<string, Room>()
  private defaultPattern: KPattern | null = null

  async init() {
    const puzzle = await puzzles['3x3x3']!.kpuzzle()
    this.defaultPattern = puzzle.defaultPattern()
  }

  createRoom(
    ownerOdol: string,
    ownerName: string,
    options: { password?: string } = {},
  ): Room {
    if (!this.defaultPattern) {
      throw new Error('RoomManager not initialized')
    }

    const id = uuidv4().slice(0, 8)
    const room: Room = {
      id,
      name: `${ownerName}'s room`,
      ownerId: ownerOdol,
      password: options.password ?? null,
      pattern: this.defaultPattern,
      serverMoveId: 0,
      users: new Map(),
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      cleanupTimer: null,
    }

    this.rooms.set(id, room)
    return room
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id)
  }

  getAllRooms(): RoomInfo[] {
    return Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      ownerId: room.ownerId,
      userCount: room.users.size,
      hasPassword: room.password !== null,
    }))
  }

  hasRoomByOwner(ownerId: string): boolean {
    for (const room of this.rooms.values()) {
      if (room.ownerId === ownerId) return true
    }
    return false
  }

  deleteRoom(id: string): boolean {
    const room = this.rooms.get(id)
    if (room?.cleanupTimer) {
      clearTimeout(room.cleanupTimer)
    }
    return this.rooms.delete(id)
  }

  resetPattern(roomId: string): number | undefined {
    const room = this.rooms.get(roomId)
    if (!room || !this.defaultPattern) return undefined

    room.pattern = this.defaultPattern
    room.serverMoveId++
    room.lastActivityAt = Date.now()
    return room.serverMoveId
  }

  scramblePattern(roomId: string): number | undefined {
    const room = this.rooms.get(roomId)
    if (!room) return undefined

    const scramble = badRandomScramble()
    for (const move of scramble) {
      room.pattern = room.pattern.applyMove(move)
    }
    room.serverMoveId++
    room.lastActivityAt = Date.now()
    return room.serverMoveId
  }

  /**
   * Add a user to a room. If user with same odol already exists, adds the socketId to their set.
   * Returns whether this is a new user (true) or existing user adding another socket (false).
   */
  addUser(roomId: string, user: RoomUser): { success: boolean; isNewUser: boolean } {
    const room = this.rooms.get(roomId)
    if (!room) return { success: false, isNewUser: false }

    const existingUser = room.users.get(user.odol)
    if (existingUser) {
      // User already in room, add this socket to their set
      for (const socketId of user.socketIds) {
        existingUser.socketIds.add(socketId)
      }
      room.lastActivityAt = Date.now()
      this.cancelCleanup(roomId)
      return { success: true, isNewUser: false }
    }

    room.users.set(user.odol, user)
    room.lastActivityAt = Date.now()
    this.cancelCleanup(roomId)
    return { success: true, isNewUser: true }
  }

  /**
   * Remove a socket from a user. Only removes the user entirely when all sockets are gone.
   * Returns whether the user was fully removed.
   */
  removeUserSocket(roomId: string, odol: string, socketId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const user = room.users.get(odol)
    if (!user) return false

    user.socketIds.delete(socketId)

    if (user.socketIds.size === 0) {
      room.users.delete(odol)
      if (room.users.size === 0) {
        this.scheduleCleanup(roomId)
      }
      return true
    }
    return false
  }

  getUser(roomId: string, odol: string): RoomUser | undefined {
    return this.rooms.get(roomId)?.users.get(odol)
  }

  getUserBySocketId(roomId: string, socketId: string): RoomUser | undefined {
    const room = this.rooms.get(roomId)
    if (!room) return undefined
    return Array.from(room.users.values()).find((u) => u.socketIds.has(socketId))
  }

  findUserRoomBySocketId(
    socketId: string,
  ): { room: Room; user: RoomUser } | undefined {
    for (const room of this.rooms.values()) {
      for (const user of room.users.values()) {
        if (user.socketIds.has(socketId)) {
          return { room, user }
        }
      }
    }
    return undefined
  }

  updateRoomSettings(roomId: string, settings: Partial<RoomSettings>): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    if (settings.password !== undefined) {
      room.password = settings.password
    }
    room.lastActivityAt = Date.now()
    return true
  }

  updatePattern(roomId: string, pattern: KPattern): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    room.pattern = pattern
    room.lastActivityAt = Date.now()
    return true
  }

  applyMove(
    roomId: string,
    move: string,
    baseServerMoveId: number,
  ): { success: true; newServerMoveId: number } | { success: false } {
    const room = this.rooms.get(roomId)
    if (!room) return { success: false }

    // Only accept if client's base matches current server state
    if (baseServerMoveId !== room.serverMoveId) {
      return { success: false }
    }

    room.pattern = room.pattern.applyMove(move)
    room.serverMoveId++
    room.lastActivityAt = Date.now()
    return { success: true, newServerMoveId: room.serverMoveId }
  }

  getServerMoveId(roomId: string): number | undefined {
    return this.rooms.get(roomId)?.serverMoveId
  }

  getRoomState(room: Room): {
    id: string
    name: string
    ownerId: string
    users: RoomUserInfo[]
    hasPassword: boolean
  } {
    return {
      id: room.id,
      name: room.name,
      ownerId: room.ownerId,
      users: Array.from(room.users.values()).map(
        ({ socketIds, ...rest }) => rest,
      ),
      hasPassword: room.password !== null,
    }
  }

  private scheduleCleanup(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.cleanupTimer = setTimeout(() => {
      const currentRoom = this.rooms.get(roomId)
      if (currentRoom && currentRoom.users.size === 0) {
        console.log(`Cleaning up empty room: ${roomId}`)
        this.deleteRoom(roomId)
      }
    }, CLEANUP_DELAY_MS)
  }

  private cancelCleanup(roomId: string) {
    const room = this.rooms.get(roomId)
    if (room?.cleanupTimer) {
      clearTimeout(room.cleanupTimer)
      room.cleanupTimer = null
    }
  }
}

function badRandomScramble(): string[] {
  const MOVES = [
    'R',
    'U',
    'F',
    'B',
    'L',
    'D',
    'Rw',
    'Uw',
    'Fw',
    'Bw',
    'Lw',
    'Dw',
  ]
  return Array.from({ length: 30 }).map(
    () => MOVES[Math.floor(Math.random() * MOVES.length)]!,
  )
}

export const roomManager = new RoomManager()
