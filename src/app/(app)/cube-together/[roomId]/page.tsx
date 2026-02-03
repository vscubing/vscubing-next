'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { LayoutHeaderTitlePortal } from '../../_layout'
import { useEventListener } from 'usehooks-ts'
import { keyToMove, type AlgLeaf, Move } from '@vscubing/cubing/alg'
import { isMove } from '@/types'
import { cn } from '@/frontend/utils/cn'
import { LoadingSpinner } from '@/frontend/ui'
import { SecondaryButton } from '@/frontend/ui/buttons'
import { useControllableSimulator } from '@/frontend/shared/simulator/use-controllable-simulator'
import { useCubeTogetherSocket } from '../_hooks/use-cube-together-socket'
import { RoomUserList } from '../_components/room-user-list'
import { RoomSettingsDialog } from '../_components/room-settings-dialog'
import { SettingsIcon, ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function CubeTogetherRoomPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const password = searchParams.get('p') ?? undefined

  const [settingsOpen, setSettingsOpen] = useState(false)

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
      toast.error('You have been kicked from the room')
      router.push('/cube-together')
    },
  })

  const { simulatorRef, applyMove } = useControllableSimulator({
    discipline: '3by3',
    pattern,
  })

  // Join room on mount
  useEffect(() => {
    console.log('Join effect:', { isConnected, roomId, currentRoomId: currentRoom?.id })
    if (!isConnected) return
    if (currentRoom?.id === roomId) return

    console.log('Calling joinRoom...')
    void joinRoom(roomId, password).then((result) => {
      console.log('joinRoom result:', result)
      if (!result.success) {
        toast.error(result.error)
        router.push('/cube-together')
      }
    })
  }, [isConnected, roomId, password, joinRoom, currentRoom?.id, router])

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
          <div
            ref={simulatorRef}
            className={cn(
              'aspect-square h-[70%] outline-none sm:h-auto sm:w-full sm:max-w-[34rem]',
              { 'opacity-0': pattern === undefined },
            )}
          />
          <LoadingSpinner
            size='lg'
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0',
              { 'opacity-100': pattern === undefined },
            )}
          />
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
            allowGuests: currentRoom.allowGuests,
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
