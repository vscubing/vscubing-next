import { createServer } from 'http'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from './types'
import { simplifyAlg } from './simplify-alg'
import type { Move } from '@/types'

// NOTE: bun --watch socket-server/index.ts

const httpServer = createServer()
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer)

let history = ''

io.on('connection', (socket) => {
  socket.emit('history', history)

  // we block processing incoming moves and queue them instead if we're awaiting simplifyAlg because it would otherwise overwrite any moves appended to history in between
  let isBlocking = false
  const queuedMoves: Move[] = []
  socket.on('onMove', async (move) => {
    queuedMoves.push(move)
    if (isBlocking) return

    if (history.length > 200) {
      isBlocking = true
      history = await simplifyAlg(history)
    }

    while (true) {
      const queuedMove = queuedMoves.shift()
      if (!queuedMove) break
      history += ' ' + queuedMove
      io.emit('onMove', queuedMove)
    }

    isBlocking = false
  })
})

const port = 3001
httpServer.listen(port)
console.log(`listening on ${port}`)
