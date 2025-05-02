import { createServer } from 'http'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from './types'
import { simplifyAlg } from './simplify-alg'

// NOTE: bun --watch socket-server/index.ts

const httpServer = createServer()
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer)

let history = ''

io.on('connection', (socket) => {
  socket.emit('history', history)

  // TODO: what happens to moves while simplifyAlg is blocking?

  socket.on('onMove', async (move) => {
    if (history.length > 200) history = await simplifyAlg(history)
    history += ' ' + move
    io.emit('onMove', move)
  })
})

const port = 3001
httpServer.listen(port)
console.log(`listening on ${port}`)
