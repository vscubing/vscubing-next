import { createServer } from 'http'
import { Server, type Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomUser,
} from './types'
import {
  createRoomOptionsSchema,
  joinRoomPayloadSchema,
  onMovePayloadSchema,
  partialRoomSettingsSchema,
} from './schemas'
import { experimentalReid3x3x3ToTwizzleBinary } from '@vscubing/cubing/protocol'
import { roomManager } from './rooms'
import {
  validateSession,
  parseSessionFromCookie,
  generateGuestName,
  type AuthUser,
} from './auth'

// NOTE: bun --watch socket-server/index.ts

type SocketData = {
  user: AuthUser | null
  odol: string // unique ID for this connection
  displayName: string
}

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>

const httpServer = createServer()

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000'

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  path: '/api/socket.io',
  cors: { origin: CORS_ORIGIN, credentials: true },
})

await roomManager.init()

io.engine.on('connection_error', (err) => {
  console.log(err.req) // the request object
  console.log(err.code) // the error code, for example 1
  console.log(err.message) // the error message, for example "Session ID unknown"
  console.log(err.context) // some additional error context
})

io.on('connection', async (socket: TypedSocket) => {
  // Authenticate user
  const cookieHeader = socket.handshake.headers.cookie
  const sessionToken = parseSessionFromCookie(cookieHeader)
  const user = await validateSession(sessionToken)

  // Set socket data
  socket.data.user = user
  socket.data.odol = user?.id ?? socket.id
  socket.data.displayName = user?.name ?? generateGuestName()

  // Send odol to client so they know their identity
  socket.emit('yourOdol', socket.data.odol)

  // Send initial room list
  socket.emit('roomList', roomManager.getAllRooms())

  // Handle get room list
  socket.on('getRoomList', () => {
    socket.emit('roomList', roomManager.getAllRooms())
  })

  // Handle create room
  socket.on('createRoom', (payloadRaw, callback) => {
    const parsed = createRoomOptionsSchema.safeParse(payloadRaw)
    if (!parsed.success) {
      callback?.({ success: false, error: 'Invalid options' })
      return
    }
    const options = parsed.data

    if (!socket.data.user) {
      callback?.({
        success: false,
        error: 'Must be logged in to create a room',
      })
      return
    }

    // Check if user already has a room
    if (roomManager.hasRoomByOwner(socket.data.odol)) {
      callback?.({
        success: false,
        error: 'You already have a room',
      })
      return
    }

    const room = roomManager.createRoom(
      socket.data.odol,
      socket.data.displayName,
      options,
    )

    // Add creator to room
    const roomUser: RoomUser = {
      odol: socket.data.odol,
      displayName: socket.data.displayName,
      isAuthenticated: true,
      socketIds: new Set([socket.id]),
    }
    roomManager.addUser(room.id, roomUser)
    void socket.join(room.id)

    // Send initial pattern to creator
    socket.emit('patternSync', {
      pattern: experimentalReid3x3x3ToTwizzleBinary(room.pattern),
      serverMoveId: room.serverMoveId,
    })

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())

    callback?.({ success: true, roomId: room.id })
  })

  // Handle join room
  socket.on('joinRoom', (payloadRaw, callback) => {
    const parsed = joinRoomPayloadSchema.safeParse(payloadRaw)
    if (!parsed.success) {
      callback?.({ success: false, error: 'Invalid payload' })
      return
    }
    const { roomId, password } = parsed.data

    const room = roomManager.getRoom(roomId)

    if (!room) {
      callback?.({ success: false, error: 'Room not found' })
      return
    }

    // Check password (skip for room owner)
    const isOwner = socket.data.odol === room.ownerId
    if (room.password && !isOwner && room.password !== password) {
      callback?.({ success: false, error: 'Incorrect password' })
      return
    }

    // Check if already in a different room with this socket
    const existingRoom = roomManager.findUserRoomBySocketId(socket.id)
    if (existingRoom && existingRoom.room.id !== roomId) {
      const wasFullyRemoved = roomManager.removeUserSocket(
        existingRoom.room.id,
        existingRoom.user.odol,
        socket.id,
      )
      socket.leave(existingRoom.room.id)
      if (wasFullyRemoved) {
        io.to(existingRoom.room.id).emit('userLeft', existingRoom.user.odol)
      }
    }

    // Add user to room
    const roomUser: RoomUser = {
      odol: socket.data.odol,
      displayName: socket.data.displayName,
      isAuthenticated: !!socket.data.user,
      socketIds: new Set([socket.id]),
    }
    const { success, isNewUser } = roomManager.addUser(room.id, roomUser)
    if (!success) {
      callback?.({ success: false, error: 'Failed to join room' })
      return
    }
    socket.join(room.id)

    // Only notify others if this is a new user (not just another tab)
    if (isNewUser) {
      socket.to(room.id).emit('userJoined', {
        odol: roomUser.odol,
        displayName: roomUser.displayName,
        isAuthenticated: roomUser.isAuthenticated,
      })
    }

    // Send room state and pattern to joining user
    socket.emit('patternSync', {
      pattern: experimentalReid3x3x3ToTwizzleBinary(room.pattern),
      serverMoveId: room.serverMoveId,
    })

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())

    const state = roomManager.getRoomState(room)
    callback?.({ success: true, state })
  })

  // Handle leave room
  socket.on('leaveRoom', () => {
    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room, user } = found
    const wasFullyRemoved = roomManager.removeUserSocket(room.id, user.odol, socket.id)
    socket.leave(room.id)

    // Only notify others if user was fully removed
    if (wasFullyRemoved) {
      io.to(room.id).emit('userLeft', user.odol)
    }

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())
  })

  // Handle moves with optimistic sync
  socket.on('onMove', async (payloadRaw) => {
    const parsed = onMovePayloadSchema.safeParse(payloadRaw)
    if (!parsed.success) {
      socket.emit('error', 'Invalid move')
      return
    }
    const { move, clientMoveId, baseServerMoveId } = parsed.data

    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found
    const result = roomManager.applyMove(room.id, move, baseServerMoveId)

    if (!result.success) {
      // Move rejected due to stale baseServerMoveId - client will handle via conflict detection
      return
    }

    // Broadcast confirmed move to all in room
    io.to(room.id).emit('moveConfirmed', {
      serverMoveId: result.newServerMoveId,
      move,
      originClientId: socket.id,
      clientMoveId,
    })
  })

  // Handle update room settings
  socket.on('updateRoomSettings', (settingsRaw) => {
    const parsed = partialRoomSettingsSchema.safeParse(settingsRaw)
    if (!parsed.success) {
      socket.emit('error', 'Invalid settings')
      return
    }
    const settings = parsed.data

    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found

    // Only owner can update settings
    if (room.ownerId !== socket.data.odol) return

    roomManager.updateRoomSettings(room.id, settings)

    // Notify all in room
    io.to(room.id).emit('roomSettingsChanged', {
      password: room.password,
    })

    // Broadcast updated room list (hasPassword might have changed)
    io.emit('roomList', roomManager.getAllRooms())
  })

  // Handle scramble cube (owner only)
  socket.on('scrambleCube', () => {
    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found

    // Only owner can scramble
    if (room.ownerId !== socket.data.odol) return

    const newServerMoveId = roomManager.scramblePattern(room.id)
    if (newServerMoveId === undefined) return

    // Broadcast new pattern to all in room
    io.to(room.id).emit('patternSync', {
      pattern: experimentalReid3x3x3ToTwizzleBinary(room.pattern),
      serverMoveId: newServerMoveId,
    })
  })

  // Handle solve cube (owner only)
  socket.on('solveCube', () => {
    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found

    // Only owner can solve
    if (room.ownerId !== socket.data.odol) return

    const newServerMoveId = roomManager.resetPattern(room.id)
    if (newServerMoveId === undefined) return

    // Broadcast new pattern to all in room
    io.to(room.id).emit('patternSync', {
      pattern: experimentalReid3x3x3ToTwizzleBinary(room.pattern),
      serverMoveId: newServerMoveId,
    })
  })

  // Handle delete room (owner only)
  socket.on('deleteRoom', () => {
    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found

    // Only owner can delete
    if (room.ownerId !== socket.data.odol) return

    // Notify all users in room
    io.to(room.id).emit('roomDeleted')

    // Remove all users from socket.io room
    for (const user of room.users.values()) {
      for (const socketId of user.socketIds) {
        const userSocket = io.sockets.sockets.get(socketId)
        userSocket?.leave(room.id)
      }
    }

    // Delete the room
    roomManager.deleteRoom(room.id)

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room, user } = found
    const wasFullyRemoved = roomManager.removeUserSocket(room.id, user.odol, socket.id)

    // Only notify others if user was fully removed
    if (wasFullyRemoved) {
      io.to(room.id).emit('userLeft', user.odol)
    }

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())
  })

  // Signal that the server is ready to receive events
  socket.emit('ready')
})

const port = process.env.PORT ?? 3002
httpServer.listen(port)
console.log(`Socket server listening on ${port}`)
