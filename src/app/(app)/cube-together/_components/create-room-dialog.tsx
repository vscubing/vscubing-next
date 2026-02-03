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
import { Checkbox } from '@/frontend/ui/checkbox'
import type { CreateRoomOptions } from 'socket-server/types'

type CreateRoomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRoom: (options: CreateRoomOptions) => Promise<void>
}

export function CreateRoomDialog({
  open,
  onOpenChange,
  onCreateRoom,
}: CreateRoomDialogProps) {
  const [password, setPassword] = useState('')
  const [allowGuests, setAllowGuests] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onCreateRoom({
        password: password || undefined,
        allowGuests,
      })
      // Reset form
      setPassword('')
      setAllowGuests(true)
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
            <DialogTitle>Create Room</DialogTitle>
            <DialogCloseCross />
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='password' className='text-sm text-grey-40'>
                Password (optional)
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Leave empty for no password'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='allowGuests'
                checked={allowGuests}
                onCheckedChange={(checked) => setAllowGuests(checked === true)}
              />
              <label htmlFor='allowGuests' className='text-sm'>
                Allow guests to join
              </label>
            </div>
            <DialogFooter className='mt-2'>
              <DialogClose version='secondary'>Cancel</DialogClose>
              <PrimaryButton type='submit' size='sm' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Room'}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
