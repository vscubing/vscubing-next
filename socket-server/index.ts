import { createServer } from 'http'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from './types'
import { puzzles } from '@vscubing/cubing/puzzles'

// NOTE: bun --watch socket-server/index.ts

const httpServer = createServer()
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: 'http://localhost:3000' },
})

const puzzle = await puzzles['3x3x3']!.kpuzzle()
let pattern = puzzle.defaultPattern()
let history = ''

io.on('connection', (socket) => {
  socket.emit('pattern', pattern.patternData)
  socket.emit('history', history)

  socket.on('onMove', async (move) => {
    pattern = pattern.applyMove(move)
    history += ' ' + move
    io.emit('onMove', move)
    io.emit('pattern', pattern.patternData)
  })
})

const port = 3001
httpServer.listen(port)
console.log(`listening on ${port}`)
