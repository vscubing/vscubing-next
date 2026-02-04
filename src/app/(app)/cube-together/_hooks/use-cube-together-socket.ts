'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import type {
  SocketClient,
  RoomInfo,
  RoomState,
  CreateRoomOptions,
  PartialRoomSettings,
  MoveConfirmed,
} from 'socket-server/types'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { experimentalTwizzleBinaryToReid3x3x3 } from '@vscubing/cubing/protocol'
import { useEventCallback } from 'usehooks-ts'
import type { Move } from '@/types'

type UseCubeTogetherSocketOptions = {
  onMove?: (move: Move, isOwnMove: boolean) => void
  onKicked?: () => void
  onConflict?: () => void // Called when pending moves are discarded due to conflict
}

type PendingMove = {
  clientMoveId: number
  move: Move
}

export function useCubeTogetherSocket(
  options: UseCubeTogetherSocketOptions = {},
) {
  const socketRef = useRef<SocketClient | null>(null)
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null)
  const [myOdol, setMyOdol] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Optimistic sync state
  const [confirmedPattern, setConfirmedPattern] = useState<
    KPattern | undefined
  >()
  const [confirmedServerMoveId, setConfirmedServerMoveId] = useState<number>(0)
  const pendingMovesRef = useRef<PendingMove[]>([])
  const nextClientMoveIdRef = useRef(0)

  // Visual pattern - only changes on initial sync or conflict (for simulator init)
  const [pattern, setPattern] = useState<KPattern | undefined>()

  const stableOnMove = useEventCallback(options.onMove ?? (() => undefined))
  const stableOnKicked = useEventCallback(options.onKicked ?? (() => undefined))
  const stableOnConflict = useEventCallback(
    options.onConflict ?? (() => undefined),
  )

  useEffect(() => {
    const _socket: SocketClient = io({
      path: '/api/socket',
      withCredentials: true,
    })
    socketRef.current = _socket

    _socket.on('ready', () => {
      setIsConnected(true)
    })

    _socket.on('yourOdol', (odol) => {
      setMyOdol(odol)
    })

    _socket.on('disconnect', () => {
      setIsConnected(false)
      setCurrentRoom(null)
      setConfirmedPattern(undefined)
      setPattern(undefined)
      pendingMovesRef.current = []
      setConfirmedServerMoveId(0)
      nextClientMoveIdRef.current = 0
    })

    _socket.on('roomList', (roomList) => {
      setRooms(roomList)
    })

    _socket.on('roomState', (state) => {
      setCurrentRoom(state)
    })

    // Full pattern sync (on join/reconnect)
    _socket.on('patternSync', ({ pattern: binaryPattern, serverMoveId }) => {
      const newPattern = experimentalTwizzleBinaryToReid3x3x3(binaryPattern)
      setConfirmedPattern(newPattern)
      setPattern(newPattern)
      setConfirmedServerMoveId(serverMoveId)
      pendingMovesRef.current = []
      nextClientMoveIdRef.current = 0
    })

    // Handle confirmed moves with optimistic reconciliation
    _socket.on('moveConfirmed', (data: MoveConfirmed) => {
      const { serverMoveId, move, originClientId, clientMoveId } = data
      const isOurMove = originClientId === _socket.id

      setConfirmedServerMoveId((prevServerMoveId) => {
        // Check for gap in serverMoveId (would need resync)
        if (serverMoveId !== prevServerMoveId + 1) {
          console.warn('ServerMoveId gap detected, may need resync')
        }
        return serverMoveId
      })

      const pending = pendingMovesRef.current
      const firstPending = pending[0]

      if (
        isOurMove &&
        firstPending &&
        firstPending.clientMoveId === clientMoveId
      ) {
        // Our move was confirmed - remove from pending, no visual update needed (already animated)
        pendingMovesRef.current = pending.slice(1)
      } else if (pending.length > 0) {
        // Conflict: someone else's move arrived while we had pending moves
        // Discard all pending moves and reset visual to confirmed + this move
        pendingMovesRef.current = []
        setConfirmedPattern((prev) => {
          if (!prev) return prev
          const newConfirmed = prev.applyMove(move)
          // Reset visual pattern to trigger simulator re-init
          setPattern(newConfirmed)
          return newConfirmed
        })
        stableOnConflict()
        return
      }

      // Update confirmed pattern (no visual change needed)
      setConfirmedPattern((prev) => {
        if (!prev) return prev
        return prev.applyMove(move)
      })

      // Notify visual update for moves from others (our moves were already animated optimistically)
      if (!isOurMove) {
        stableOnMove(move, false)
      }
    })

    _socket.on('userJoined', (user) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          users: [...prev.users, user],
        }
      })
    })

    _socket.on('userLeft', (odol) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          users: prev.users.filter((u) => u.odol !== odol),
        }
      })
    })

    _socket.on('kicked', () => {
      setCurrentRoom(null)
      setConfirmedPattern(undefined)
      setPattern(undefined)
      pendingMovesRef.current = []
      stableOnKicked()
    })

    _socket.on('roomSettingsChanged', (settings) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          hasPassword: settings.password !== null,
        }
      })
    })

    _socket.on('error', (message) => {
      console.error('Socket error:', message)
    })

    return () => {
      socketRef.current = null
      _socket.close()
    }
  }, [stableOnMove, stableOnKicked, stableOnConflict])

  const createRoom = useCallback(
    (
      options: CreateRoomOptions = {},
    ): Promise<
      { success: true; roomId: string } | { success: false; error: string }
    > => {
      return new Promise((resolve) => {
        const socket = socketRef.current
        if (!socket) {
          resolve({ success: false, error: 'Not connected' })
          return
        }
        socket.emit('createRoom', options, (result) => {
          resolve(result)
        })
      })
    },
    [],
  )

  const joinRoom = useCallback(
    (
      roomId: string,
      password?: string,
    ): Promise<
      { success: true; state: RoomState } | { success: false; error: string }
    > => {
      return new Promise((resolve) => {
        const socket = socketRef.current
        if (!socket) {
          resolve({ success: false, error: 'Not connected' })
          return
        }
        if (!socket.connected) {
          resolve({ success: false, error: 'Socket not connected' })
          return
        }

        // Set up a one-time listener for patternSync before joining
        let patternSyncReceived = false
        let joinCallbackReceived = false
        let callbackResult:
          | { success: true; state: RoomState }
          | { success: false; error: string }
          | null = null

        const timeout = setTimeout(() => {
          if (!patternSyncReceived || !joinCallbackReceived) {
            console.warn('Join room timeout: pattern sync or callback not received')
            socket.off('patternSync', patternSyncHandler)
            if (callbackResult && !callbackResult.success) {
              // If callback already came back with error, use that
              resolve(callbackResult)
            } else {
              resolve({ success: false, error: 'Connection timeout' })
            }
          }
        }, 10000) // 10 second timeout

        const patternSyncHandler = () => {
          patternSyncReceived = true
          socket.off('patternSync', patternSyncHandler)
          
          // Only resolve if both patternSync and callback have been received
          if (joinCallbackReceived && callbackResult) {
            clearTimeout(timeout)
            resolve(callbackResult)
          }
        }

        // Listen for the next patternSync event
        socket.once('patternSync', patternSyncHandler)

        socket.emit('joinRoom', { roomId, password }, (result) => {
          joinCallbackReceived = true
          callbackResult = result
          
          if (result.success) {
            setCurrentRoom(result.state)
          } else {
            // On error, we don't wait for patternSync
            socket.off('patternSync', patternSyncHandler)
            clearTimeout(timeout)
            resolve(result)
            return
          }

          // Only resolve if both patternSync and callback have been received
          if (patternSyncReceived) {
            clearTimeout(timeout)
            resolve(result)
          }
        })
      })
    },
    [],
  )

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current
    if (!socket) return
    socket.emit('leaveRoom')
    setCurrentRoom(null)
    setConfirmedPattern(undefined)
    setPattern(undefined)
    pendingMovesRef.current = []
    setConfirmedServerMoveId(0)
    nextClientMoveIdRef.current = 0
  }, [])

  const sendMove = useCallback(
    (move: Move) => {
      const socket = socketRef.current
      if (!socket || !currentRoom || confirmedPattern === undefined) return

      // Get current state for optimistic update
      const clientMoveId = nextClientMoveIdRef.current++

      // Compute baseServerMoveId: confirmed + pending moves already sent
      const baseServerMoveId =
        confirmedServerMoveId + pendingMovesRef.current.length

      // Add to pending moves (optimistic)
      pendingMovesRef.current = [
        ...pendingMovesRef.current,
        { clientMoveId, move },
      ]

      // Trigger optimistic visual update
      stableOnMove(move, true)

      // Send to server
      socket.emit('onMove', { move, clientMoveId, baseServerMoveId })
    },
    [currentRoom, confirmedPattern, confirmedServerMoveId, stableOnMove],
  )

  const kickUser = useCallback(
    (odol: string) => {
      const socket = socketRef.current
      if (!socket || !currentRoom) return
      socket.emit('kickUser', { odol })
    },
    [currentRoom],
  )

  const updateSettings = useCallback(
    (settings: PartialRoomSettings) => {
      const socket = socketRef.current
      if (!socket || !currentRoom) return
      socket.emit('updateRoomSettings', settings)
    },
    [currentRoom],
  )

  const refreshRooms = useCallback(() => {
    const socket = socketRef.current
    if (!socket) return
    socket.emit('getRoomList')
  }, [])

  // Determine if current user is the owner
  const isOwner = currentRoom ? currentRoom.ownerId === myOdol : false

  return {
    // State
    isConnected,
    rooms,
    currentRoom,
    pattern,
    isOwner,
    myOdol,
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    kickUser,
    updateSettings,
    refreshRooms,
  }
}
