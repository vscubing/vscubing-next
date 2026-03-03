'use client'

import Link from 'next/link'
import type { RoomInfo } from 'socket-server/types'
import { cn } from '@/frontend/utils/cn'
import { LockIcon, UsersIcon, StarIcon } from 'lucide-react'

type RoomListProps = {
  rooms: RoomInfo[]
  myOdol: string | null
  onJoinRoom: (room: RoomInfo) => void
}

export function RoomList({ rooms, myOdol, onJoinRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className='text-grey-40 flex flex-1 items-center justify-center'>
        <p>No rooms available. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className='grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
      {rooms.map((room) => {
        const isMyRoom = room.ownerId === myOdol
        return (
          <Link
            key={room.id}
            href={`/cube-together/${room.id}`}
            onClick={(e) => {
              if (room.hasPassword && !isMyRoom) {
                e.preventDefault()
                onJoinRoom(room)
              }
            }}
            className={cn(
              'flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
              isMyRoom
                ? 'border-primary-60 bg-primary-80/10'
                : 'border-secondary-20 bg-black-80',
              'hover:border-primary-60 hover:bg-black-100',
            )}
          >
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2'>
                {isMyRoom && (
                  <StarIcon className='text-primary-60 h-4 w-4 flex-shrink-0' />
                )}
                <h3 className='text-white-100 truncate text-lg font-medium'>
                  {room.name}
                </h3>
              </div>
              {room.hasPassword && (
                <LockIcon className='text-grey-40 h-4 w-4 flex-shrink-0' />
              )}
            </div>
            <div className='text-grey-40 flex items-center gap-1 text-sm'>
              <UsersIcon className='h-4 w-4' />
              <span>
                {room.userCount} {room.userCount === 1 ? 'user' : 'users'}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
