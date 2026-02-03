import { puzzles } from '@vscubing/cubing/puzzles'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { v4 as uuidv4 } from 'uuid'
import type { RoomUser, RoomInfo, RoomSettings, RoomUserInfo } from './types'

export type Room = {
  id: string
  name: string
  ownerId: string
  password: string | null
  allowGuests: boolean
  pattern: KPattern
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
    options: { password?: string; allowGuests?: boolean } = {},
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
      allowGuests: options.allowGuests ?? true,
      pattern: this.defaultPattern,
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
      userCount: room.users.size,
      hasPassword: room.password !== null,
      allowGuests: room.allowGuests,
    }))
  }

  deleteRoom(id: string): boolean {
    const room = this.rooms.get(id)
    if (room?.cleanupTimer) {
      clearTimeout(room.cleanupTimer)
    }
    return this.rooms.delete(id)
  }

  addUser(roomId: string, user: RoomUser): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    room.users.set(user.odol, user)
    room.lastActivityAt = Date.now()
    this.cancelCleanup(roomId)
    return true
  }

  removeUser(roomId: string, odol: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const removed = room.users.delete(odol)
    if (removed && room.users.size === 0) {
      this.scheduleCleanup(roomId)
    }
    return removed
  }

  getUser(roomId: string, odol: string): RoomUser | undefined {
    return this.rooms.get(roomId)?.users.get(odol)
  }

  getUserBySocketId(roomId: string, socketId: string): RoomUser | undefined {
    const room = this.rooms.get(roomId)
    if (!room) return undefined
    return Array.from(room.users.values()).find((u) => u.socketId === socketId)
  }

  findUserRoomBySocketId(
    socketId: string,
  ): { room: Room; user: RoomUser } | undefined {
    for (const room of this.rooms.values()) {
      for (const user of room.users.values()) {
        if (user.socketId === socketId) {
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
    if (settings.allowGuests !== undefined) {
      room.allowGuests = settings.allowGuests
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

  getRoomState(room: Room): {
    id: string
    name: string
    ownerId: string
    users: RoomUserInfo[]
    hasPassword: boolean
    allowGuests: boolean
  } {
    return {
      id: room.id,
      name: room.name,
      ownerId: room.ownerId,
      users: Array.from(room.users.values()).map(
        ({ socketId, ...rest }) => rest,
      ),
      hasPassword: room.password !== null,
      allowGuests: room.allowGuests,
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

export const roomManager = new RoomManager()
