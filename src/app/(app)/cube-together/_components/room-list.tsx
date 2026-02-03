'use client'

import type { RoomInfo } from 'socket-server/types'
import { cn } from '@/frontend/utils/cn'
import { LockIcon, UsersIcon } from 'lucide-react'

type RoomListProps = {
  rooms: RoomInfo[]
  onJoinRoom: (room: RoomInfo) => void
}

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center text-grey-40'>
        <p>No rooms available. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className='grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onJoinRoom(room)}
          className={cn(
            'flex flex-col gap-2 rounded-xl border border-secondary-20 bg-black-80 p-4 text-left transition-colors',
            'hover:border-primary-60 hover:bg-black-100',
          )}
        >
          <div className='flex items-center justify-between gap-2'>
            <h3 className='truncate text-lg font-medium text-white-100'>
              {room.name}
            </h3>
            {room.hasPassword && (
              <LockIcon className='h-4 w-4 flex-shrink-0 text-grey-40' />
            )}
          </div>
          <div className='flex items-center gap-1 text-sm text-grey-40'>
            <UsersIcon className='h-4 w-4' />
            <span>
              {room.userCount} {room.userCount === 1 ? 'user' : 'users'}
            </span>
            {!room.allowGuests && (
              <span className='ml-2 rounded bg-secondary-20 px-1.5 py-0.5 text-xs'>
                Members only
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
