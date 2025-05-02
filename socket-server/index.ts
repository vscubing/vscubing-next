import { createServer } from 'http'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from './types'

// NOTE: bun --watch socket-server/index.ts

const httpServer = createServer()
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer)

let history = ''

io.on('connection', async (socket) => {
  socket.emit('history', history)
  console.log(`history requested: ${history}`)

  socket.on('onMove', (move) => {
    history += ' ' + move
    io.emit('onMove', move)
  })
})

const port = 3001
httpServer.listen(port)
console.log(`listening on ${port}`)
