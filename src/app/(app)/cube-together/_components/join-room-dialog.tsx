'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogClose,
  DialogCloseCross,
} from '@/frontend/ui/popovers'
import { Input } from '@/frontend/ui'
import { PrimaryButton } from '@/frontend/ui/buttons'

type JoinRoomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomName: string
  onJoinRoom: (
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
}

export function JoinRoomDialog({
  open,
  onOpenChange,
  roomName,
  onJoinRoom,
}: JoinRoomDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const result = await onJoinRoom(password)
      if (!result.success) {
        setError(result.error ?? 'Failed to join room')
      } else {
        setPassword('')
        onOpenChange(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className='max-w-md'>
          <div className='mb-4 flex items-center justify-between'>
            <DialogTitle>Join {roomName}</DialogTitle>
            <DialogCloseCross />
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <p className='text-sm text-grey-40'>
              This room requires a password to join.
            </p>
            <div className='flex flex-col gap-2'>
              <label htmlFor='join-password' className='text-sm text-grey-40'>
                Password
              </label>
              <Input
                id='join-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter room password'
                error={!!error}
              />
              {error && <p className='text-sm text-red-80'>{error}</p>}
            </div>
            <DialogFooter className='mt-2'>
              <DialogClose version='secondary'>Cancel</DialogClose>
              <PrimaryButton type='submit' size='sm' disabled={isLoading}>
                {isLoading ? 'Joining...' : 'Join Room'}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
