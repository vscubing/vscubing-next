'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { useLogout } from '@/frontend/shared/use-user'

const DISCORD_INVITE_LINK = 'https://discord.com/users/964540226112462858'
const CONTACT_EMAIL = 'contact.vscubing@gmail.com'

export function SuspendedDialog() {
  const trpc = useTRPC()
  const { data: userMetadata } = useQuery(
    trpc.userMetadata.userMetadata.queryOptions(),
  )
  const { logout, isPending } = useLogout()

  const isVisible = userMetadata?.suspended === true

  return (
    <AlertDialog open={isVisible}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle className='mb-4'>
            Your account was suspended
          </AlertDialogTitle>
          <AlertDialogDescription className='text-grey-20 text-center'>
            Please contact us on{' '}
            <a
              href={DISCORD_INVITE_LINK}
              target='_blank'
              rel='noreferrer'
              className='text-primary-100 underline'
            >
              Discord
            </a>{' '}
            or at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className='text-primary-100 underline'
            >
              {CONTACT_EMAIL}
            </a>{' '}
            to help us figure this out together.
          </AlertDialogDescription>
          <AlertDialogFooter className='mt-8'>
            <AlertDialogCancel
              onClick={() => logout()}
              disabled={isPending}
              type='button'
            >
              Log out
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
