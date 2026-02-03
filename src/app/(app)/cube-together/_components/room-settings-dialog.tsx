'use client'

import { useState, useEffect } from 'react'
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
import type { RoomSettings } from 'socket-server/types'

type RoomSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSettings: { hasPassword: boolean; allowGuests: boolean }
  onUpdateSettings: (settings: Partial<RoomSettings>) => void
}

export function RoomSettingsDialog({
  open,
  onOpenChange,
  currentSettings,
  onUpdateSettings,
}: RoomSettingsDialogProps) {
  const [password, setPassword] = useState('')
  const [removePassword, setRemovePassword] = useState(false)
  const [allowGuests, setAllowGuests] = useState(currentSettings.allowGuests)

  useEffect(() => {
    setAllowGuests(currentSettings.allowGuests)
    setRemovePassword(false)
    setPassword('')
  }, [currentSettings, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const settings: Partial<RoomSettings> = {}

    if (removePassword) {
      settings.password = null
    } else if (password) {
      settings.password = password
    }

    if (allowGuests !== currentSettings.allowGuests) {
      settings.allowGuests = allowGuests
    }

    if (Object.keys(settings).length > 0) {
      onUpdateSettings(settings)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className='max-w-md'>
          <div className='mb-4 flex items-center justify-between'>
            <DialogTitle>Room Settings</DialogTitle>
            <DialogCloseCross />
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='new-password' className='text-sm text-grey-40'>
                {currentSettings.hasPassword
                  ? 'Change Password'
                  : 'Set Password'}
              </label>
              <Input
                id='new-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  currentSettings.hasPassword
                    ? 'Enter new password'
                    : 'Leave empty for no password'
                }
                disabled={removePassword}
              />
              {currentSettings.hasPassword && (
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='removePassword'
                    checked={removePassword}
                    onCheckedChange={(checked) => {
                      setRemovePassword(checked === true)
                      if (checked) setPassword('')
                    }}
                  />
                  <label htmlFor='removePassword' className='text-sm'>
                    Remove password
                  </label>
                </div>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='settingsAllowGuests'
                checked={allowGuests}
                onCheckedChange={(checked) => setAllowGuests(checked === true)}
              />
              <label htmlFor='settingsAllowGuests' className='text-sm'>
                Allow guests to join
              </label>
            </div>
            <DialogFooter className='mt-2'>
              <DialogClose version='secondary'>Cancel</DialogClose>
              <PrimaryButton type='submit' size='sm'>
                Save Changes
              </PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
