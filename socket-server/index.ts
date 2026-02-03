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
  kickUserPayloadSchema,
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
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  cors: { origin: 'http://localhost:3000', credentials: true },
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
      socketId: socket.id,
    }
    roomManager.addUser(room.id, roomUser)
    void socket.join(room.id)

    // Send initial pattern to creator
    socket.emit('pattern', experimentalReid3x3x3ToTwizzleBinary(room.pattern))

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

    // Check if already in a room
    const existingRoom = roomManager.findUserRoomBySocketId(socket.id)
    if (existingRoom) {
      roomManager.removeUser(existingRoom.room.id, existingRoom.user.odol)
      socket.leave(existingRoom.room.id)
      io.to(existingRoom.room.id).emit('userLeft', existingRoom.user.odol)
    }

    // Add user to room
    const roomUser: RoomUser = {
      odol: socket.data.odol,
      displayName: socket.data.displayName,
      isAuthenticated: !!socket.data.user,
      socketId: socket.id,
    }
    roomManager.addUser(room.id, roomUser)
    socket.join(room.id)

    // Notify others in room
    socket.to(room.id).emit('userJoined', {
      odol: roomUser.odol,
      displayName: roomUser.displayName,
      isAuthenticated: roomUser.isAuthenticated,
    })

    // Send room state and pattern to joining user
    socket.emit('pattern', experimentalReid3x3x3ToTwizzleBinary(room.pattern))

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
    roomManager.removeUser(room.id, user.odol)
    socket.leave(room.id)

    // Notify others
    io.to(room.id).emit('userLeft', user.odol)

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())
  })

  // Handle moves
  socket.on('onMove', async (payloadRaw) => {
    const parsed = onMovePayloadSchema.safeParse(payloadRaw)
    if (!parsed.success) {
      socket.emit('error', 'Invalid move')
      return
    }
    const { move } = parsed.data

    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found
    const newPattern = room.pattern.applyMove(move)
    roomManager.updatePattern(room.id, newPattern)

    // Broadcast to all in room (including sender for consistency)
    io.to(room.id).emit('onMove', move)
  })

  // Handle kick user
  socket.on('kickUser', (payloadRaw) => {
    const parsed = kickUserPayloadSchema.safeParse(payloadRaw)
    if (!parsed.success) {
      socket.emit('error', 'Invalid payload')
      return
    }
    const { odol } = parsed.data

    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room } = found

    // Only owner can kick
    if (room.ownerId !== socket.data.odol) return

    // Can't kick yourself
    if (odol === socket.data.odol) return

    const userToKick = roomManager.getUser(room.id, odol)
    if (!userToKick) return

    // Remove user
    roomManager.removeUser(room.id, odol)

    // Notify the kicked user
    io.to(userToKick.socketId).emit('kicked')

    // Remove from socket.io room
    const kickedSocket = io.sockets.sockets.get(userToKick.socketId)
    kickedSocket?.leave(room.id)

    // Notify others
    io.to(room.id).emit('userLeft', odol)

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())
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

  // Handle disconnect
  socket.on('disconnect', () => {
    const found = roomManager.findUserRoomBySocketId(socket.id)
    if (!found) return

    const { room, user } = found
    roomManager.removeUser(room.id, user.odol)

    // Notify others
    io.to(room.id).emit('userLeft', user.odol)

    // Broadcast updated room list
    io.emit('roomList', roomManager.getAllRooms())
  })

  // Signal that the server is ready to receive events
  socket.emit('ready')
})

const port = 3001
httpServer.listen(port)
console.log(`Socket server listening on ${port}`)
