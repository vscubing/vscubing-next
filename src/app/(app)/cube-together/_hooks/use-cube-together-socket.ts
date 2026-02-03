'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import type {
  SocketClient,
  RoomInfo,
  RoomState,
  CreateRoomOptions,
  PartialRoomSettings,
} from 'socket-server/types'
import type { KPattern } from '@vscubing/cubing/kpuzzle'
import { experimentalTwizzleBinaryToReid3x3x3 } from '@vscubing/cubing/protocol'
import { useEventCallback } from 'usehooks-ts'
import type { Move } from '@/types'

type UseCubeTogetherSocketOptions = {
  onMove?: (move: Move) => void
  onKicked?: () => void
}

export function useCubeTogetherSocket(
  options: UseCubeTogetherSocketOptions = {},
) {
  const socketRef = useRef<SocketClient | null>(null)
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null)
  const [pattern, setPattern] = useState<KPattern | undefined>()
  const [myOdol, setMyOdol] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const stableOnMove = useEventCallback(options.onMove ?? (() => undefined))
  const stableOnKicked = useEventCallback(options.onKicked ?? (() => undefined))

  useEffect(() => {
    const _socket: SocketClient = io('ws://localhost:3001', {
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
      setPattern(undefined)
    })

    _socket.on('roomList', (roomList) => {
      setRooms(roomList)
    })

    _socket.on('roomState', (state) => {
      setCurrentRoom(state)
    })

    _socket.on('pattern', (binaryPattern) => {
      setPattern(experimentalTwizzleBinaryToReid3x3x3(binaryPattern))
    })

    _socket.on('onMove', (move) => {
      stableOnMove(move)
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
      setPattern(undefined)
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
  }, [stableOnMove, stableOnKicked])

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
    setPattern(undefined)
  }, [])

  const sendMove = useCallback(
    (move: Move) => {
      const socket = socketRef.current
      if (!socket || !currentRoom) return
      socket.emit('onMove', { move })
    },
    [currentRoom],
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
