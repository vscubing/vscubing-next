'use client'

import type { RoomUserInfo } from 'socket-server/types'
import { cn } from '@/frontend/utils/cn'
import { CrownIcon } from 'lucide-react'

type RoomUserListProps = {
  users: RoomUserInfo[]
  ownerId: string
  myOdol: string | null
}

export function RoomUserList({ users, ownerId, myOdol }: RoomUserListProps) {
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-medium text-grey-40'>
        Users ({users.length})
      </h3>
      <ul className='flex flex-col gap-1'>
        {users.map((user) => (
          <li
            key={user.odol}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2',
              user.odol === myOdol ? 'bg-secondary-60' : 'bg-black-100',
            )}
          >
            <div className='flex items-center gap-2'>
              <span className='text-sm'>
                {user.displayName}
                {user.odol === myOdol && (
                  <span className='ml-1 text-grey-40'>(you)</span>
                )}
              </span>
              {user.odol === ownerId && (
                <CrownIcon className='h-4 w-4 text-primary-80' />
              )}
              {!user.isAuthenticated && (
                <span className='rounded bg-grey-60 px-1.5 py-0.5 text-xs text-grey-20'>
                  Guest
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
