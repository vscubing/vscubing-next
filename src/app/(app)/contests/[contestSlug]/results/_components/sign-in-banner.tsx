'use client'

import { SignInButton } from '@/frontend/shared/sign-in-button'
import { useUser } from '@/frontend/shared/use-user'

export function SignInBanner({ isOngoing }: { isOngoing: boolean }) {
  const { user, isLoading } = useUser()

  if (!isOngoing || user || isLoading) return null

  return (
    <div className='sticky bottom-0 mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-secondary-20 bg-secondary-80 px-4 py-5'>
      <span className='title-h3'>To participate in this round:</span>{' '}
      <SignInButton variant='ghost' />
    </div>
  )
}
