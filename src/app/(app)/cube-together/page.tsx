'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutHeaderTitlePortal } from '../_layout'
import { useUser } from '@/frontend/shared/use-user'
import { PrimaryButton } from '@/frontend/ui/buttons'
import { LoadingSpinner } from '@/frontend/ui'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/frontend/ui/tooltip'
import { useCubeTogetherSocket } from './_hooks/use-cube-together-socket'
import { RoomList } from './_components/room-list'
import { CreateRoomDialog } from './_components/create-room-dialog'
import { JoinRoomDialog } from './_components/join-room-dialog'
import type { RoomInfo, CreateRoomOptions } from 'socket-server/types'

export default function CubeTogetherLobbyPage() {
  const router = useRouter()
  const { user } = useUser()
  const { rooms, isConnected, createRoom, joinRoom } = useCubeTogetherSocket()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [joinDialogRoom, setJoinDialogRoom] = useState<RoomInfo | null>(null)

  const handleCreateRoom = async (options: CreateRoomOptions) => {
    const result = await createRoom(options)
    if (result.success) {
      setCreateDialogOpen(false)
      router.push(`/cube-together/${result.roomId}`)
    }
  }

  const handleJoinRoom = (room: RoomInfo) => {
    if (room.hasPassword) {
      setJoinDialogRoom(room)
    } else {
      // Just navigate - the room page will handle joining
      router.push(`/cube-together/${room.id}`)
    }
  }

  const handleJoinWithPassword = async (password: string) => {
    if (!joinDialogRoom) return { success: false, error: 'No room selected' }
    // For password rooms, we need to validate first before navigating
    const result = await joinRoom(joinDialogRoom.id, password)
    if (result.success) {
      // Pass password via URL so room page can use it
      router.push(`/cube-together/${joinDialogRoom.id}?p=${encodeURIComponent(password)}`)
    }
    return result
  }

  return (
    <>
      <LayoutHeaderTitlePortal>Cube together</LayoutHeaderTitlePortal>
      <div className='flex flex-1 flex-col gap-4 rounded-2xl bg-black-80 p-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-medium'>Rooms</h2>
          {user ? (
            <PrimaryButton size='sm' onClick={() => setCreateDialogOpen(true)}>
              Create Room
            </PrimaryButton>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <PrimaryButton size='sm' disabled>
                    Create Room
                  </PrimaryButton>
                </span>
              </TooltipTrigger>
              <TooltipContent>Sign in to create a room</TooltipContent>
            </Tooltip>
          )}
        </div>

        {!isConnected ? (
          <div className='flex flex-1 items-center justify-center'>
            <LoadingSpinner size='lg' />
          </div>
        ) : (
          <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} />
        )}
      </div>

      <CreateRoomDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateRoom={handleCreateRoom}
      />

      <JoinRoomDialog
        open={!!joinDialogRoom}
        onOpenChange={(open) => !open && setJoinDialogRoom(null)}
        roomName={joinDialogRoom?.name ?? ''}
        onJoinRoom={handleJoinWithPassword}
      />
    </>
  )
}
