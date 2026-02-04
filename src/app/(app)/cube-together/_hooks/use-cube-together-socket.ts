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
import { env } from '@/env'

type UseCubeTogetherSocketOptions = {
  onMove?: (move: Move, isOwnMove: boolean) => void
  onKicked?: () => void
  onConflict?: () => void // Called when pending moves are discarded due to conflict
  onRoomDeleted?: () => void
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
  const stableOnRoomDeleted = useEventCallback(
    options.onRoomDeleted ?? (() => undefined),
  )

  useEffect(() => {
    const _socket: SocketClient = io(env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
      path: '/api/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling', 'webtransport'],
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
        // Defensive: don't add if user with same odol already exists
        if (prev.users.some((u) => u.odol === user.odol)) {
          return prev
        }
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

    _socket.on('roomDeleted', () => {
      setCurrentRoom(null)
      setConfirmedPattern(undefined)
      setPattern(undefined)
      pendingMovesRef.current = []
      stableOnRoomDeleted()
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
  }, [stableOnMove, stableOnKicked, stableOnConflict, stableOnRoomDeleted])

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
        socket.emit('joinRoom', { roomId, password }, (result) => {
          if (result.success) {
            setCurrentRoom(result.state)
          }
          resolve(result)
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

  const scrambleCube = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !currentRoom) return
    socket.emit('scrambleCube')
  }, [currentRoom])

  const solveCube = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !currentRoom) return
    socket.emit('solveCube')
  }, [currentRoom])

  const deleteRoom = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !currentRoom) return
    socket.emit('deleteRoom')
  }, [currentRoom])

  // Determine if current user is the owner
  const isOwner = currentRoom ? currentRoom.ownerId === myOdol : false

  // Check if user already has a room
  const hasOwnRoom = rooms.some((r) => r.ownerId === myOdol)

  return {
    // State
    isConnected,
    rooms,
    currentRoom,
    pattern,
    isOwner,
    myOdol,
    hasOwnRoom,
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    updateSettings,
    refreshRooms,
    scrambleCube,
    solveCube,
    deleteRoom,
  }
}
