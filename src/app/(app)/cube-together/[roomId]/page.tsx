'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { LayoutHeaderTitlePortal } from '../../_layout'
import { useEventListener } from 'usehooks-ts'
import { keyToMove, type AlgLeaf, Move } from '@vscubing/cubing/alg'
import { isMove } from '@/types'
import { LoadingSpinner } from '@/frontend/ui'
import { SecondaryButton } from '@/frontend/ui/buttons'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { useCubeTogetherSocket } from '../_hooks/use-cube-together-socket'
import { RoomUserList } from '../_components/room-user-list'
import { RoomSettingsDialog } from '../_components/room-settings-dialog'
import { JoinRoomDialog } from '../_components/join-room-dialog'
import { SettingsIcon, ArrowLeftIcon } from 'lucide-react'
import { toast } from '@/frontend/ui/popovers'

export default function CubeTogetherRoomPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const password = searchParams.get('p') ?? undefined

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const joinAttempted = useRef(false)
  const joinedSuccessfully = useRef(false)

  const {
    pattern,
    currentRoom,
    isOwner,
    myOdol,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMove,
    kickUser,
    updateSettings,
  } = useCubeTogetherSocket({
    onMove: (move) => applyMove(move),
    onKicked: () => {
      toast({
        title: 'Kicked',
        description: 'You have been kicked from the room',
      })
      router.push('/cube-together')
    },
  })

  const { simulatorRef, applyMove } = useControllableSimulator({
    discipline: '3by3',
    pattern,
  })

  // Join room on mount
  useEffect(() => {
    if (!isConnected) return
    if (currentRoom?.id === roomId) return
    if (joinAttempted.current) return

    joinAttempted.current = true
    void joinRoom(roomId, password).then((result) => {
      if (!result.success) {
        if (result.error === 'Incorrect password') {
          setPasswordDialogOpen(true)
        } else {
          toast({ title: 'Error', description: result.error })
          router.push('/cube-together')
        }
      }
    })
  }, [isConnected, roomId, password, joinRoom, currentRoom?.id, router])

  const handleJoinWithPassword = async (enteredPassword: string) => {
    const result = await joinRoom(roomId, enteredPassword)
    if (result.success) {
      joinedSuccessfully.current = true
      setPasswordDialogOpen(false)
    }
    return result
  }

  const handlePasswordDialogClose = (open: boolean) => {
    setPasswordDialogOpen(open)
    // Only redirect if user explicitly closed dialog (not after successful join)
    if (!open && !joinedSuccessfully.current) {
      router.push('/cube-together')
    }
  }

  // Leave room on unmount
  useEffect(() => {
    return () => {
      leaveRoom()
    }
  }, [leaveRoom])

  useEventListener('keydown', (e) => {
    const move = keyToMove(cube3x3x3KeyMapping, e)?.toString()
    if (!move || !isMove(move)) return
    sendMove(move)
  })

  const handleBack = () => {
    leaveRoom()
    router.push('/cube-together')
  }

  // Show password dialog when needed
  if (passwordDialogOpen) {
    return (
      <>
        <LayoutHeaderTitlePortal>Cube together</LayoutHeaderTitlePortal>
        <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80'>
          <JoinRoomDialog
            open={passwordDialogOpen}
            onOpenChange={handlePasswordDialogClose}
            roomName={`Room ${roomId}`}
            onJoinRoom={handleJoinWithPassword}
          />
        </div>
      </>
    )
  }

  if (!isConnected || !currentRoom) {
    return (
      <>
        <LayoutHeaderTitlePortal>Cube together</LayoutHeaderTitlePortal>
        <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80'>
          <LoadingSpinner size='lg' />
        </div>
      </>
    )
  }

  return (
    <>
      <LayoutHeaderTitlePortal>{currentRoom.name}</LayoutHeaderTitlePortal>
      <div className='flex flex-1 gap-4'>
        {/* Main cube area */}
        <div className='relative flex flex-1 items-center justify-center rounded-2xl bg-black-80 p-4'>
          {pattern === undefined ? (
            <LoadingSpinner size='lg' />
          ) : (
            <div
              ref={simulatorRef}
              className='aspect-square h-[70%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem]'
            />
          )}
        </div>

        {/* Sidebar */}
        <div className='flex w-64 flex-col gap-4 rounded-2xl bg-black-80 p-4'>
          <div className='flex items-center justify-between'>
            <SecondaryButton size='sm' onClick={handleBack}>
              <ArrowLeftIcon className='mr-1 h-4 w-4' />
              Leave
            </SecondaryButton>
            {isOwner && (
              <SecondaryButton
                size='iconSm'
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon className='h-4 w-4' />
              </SecondaryButton>
            )}
          </div>

          <RoomUserList
            users={currentRoom.users}
            ownerId={currentRoom.ownerId}
            myOdol={myOdol}
            isOwner={isOwner}
            onKickUser={kickUser}
          />
        </div>
      </div>

      {isOwner && (
        <RoomSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          currentSettings={{
            hasPassword: currentRoom.hasPassword,
          }}
          onUpdateSettings={updateSettings}
        />
      )}
    </>
  )
}

const cube3x3x3KeyMapping: Record<number | string, AlgLeaf> = {
  Digit1: new Move("S'"),
  Digit2: new Move('E'),
  Digit5: new Move('M'),
  Digit6: new Move('M'),
  Digit9: new Move("E'"),
  Digit0: new Move('S'),

  KeyI: new Move('R'),
  KeyK: new Move("R'"),
  KeyW: new Move('B'),
  KeyO: new Move("B'"),
  KeyS: new Move('D'),
  KeyL: new Move("D'"),
  KeyD: new Move('L'),
  KeyE: new Move("L'"),
  KeyJ: new Move('U'),
  KeyF: new Move("U'"),
  KeyH: new Move('F'),
  KeyG: new Move("F'"),

  KeyC: new Move("Uw'"),
  KeyR: new Move("Lw'"),
  KeyU: new Move('Rw'),
  KeyM: new Move("Rw'"),

  KeyX: new Move("M'"),
  Comma: new Move('Uw'),

  KeyT: new Move('x'),
  KeyY: new Move('x'),
  KeyV: new Move('Lw'),
  KeyN: new Move("x'"),
  Semicolon: new Move('y'),
  KeyA: new Move("y'"),
  KeyP: new Move('z'),
  KeyQ: new Move("z'"),

  KeyZ: new Move('Dw'),
  KeyB: new Move("x'"),
  Period: new Move("M'"),
  Slash: new Move("Dw'"),
}
