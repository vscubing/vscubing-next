'use client'

import { cn } from '@/frontend/utils/cn'
import { GhostButton, GoogleIcon, PrimaryButton, toast } from '@/frontend/ui'
import { useEffect, type MouseEventHandler } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GOOGLE_AUTH_ERROR_SEARCH_PARAM } from '../../app/api/auth/google/error-search-param'
import { useRemoveSearchParam } from '@/lib/utils/use-remove-search-param'

const GOOGLE_AUTH_HREF = '/api/auth/google'
type SignInButtonProps = { variant: 'primary' | 'ghost'; className?: string }
export function SignInButton({ variant, className }: SignInButtonProps) {
  const router = useRouter()

  const signIn: MouseEventHandler = (e) => {
    e.preventDefault()
    router.push(`${GOOGLE_AUTH_HREF}?redirectTo=${window.location.toString()}`)
  }

  const searchParams = useSearchParams()
  const { removeSearchParam } = useRemoveSearchParam()
  useEffect(() => {
    const callbackError = searchParams.get(GOOGLE_AUTH_ERROR_SEARCH_PARAM)
    if (callbackError) {
      toast({
        title: 'Authorization error',
        description: 'Something went wrong during the authorization.',
        contactUsButton: true,
        dedupId: 'google-auth-error',
      })
      removeSearchParam(GOOGLE_AUTH_ERROR_SEARCH_PARAM)
    }
  }, [searchParams, removeSearchParam])

  if (variant === 'primary') {
    return (
      <PrimaryButton
        className={cn('h-12 gap-3 px-4 text-[1.125rem] sm:h-12', className)}
        asChild
      >
        <a href={GOOGLE_AUTH_HREF} onClick={signIn}>
          <GoogleIcon />
          Sign in with Google
        </a>
      </PrimaryButton>
    )
  }

  return (
    <GhostButton
      className={cn(
        'h-12 gap-3 px-4 text-[1.125rem] hover:border hover:border-white-100 hover:bg-transparent active:bg-white-100 active:text-black-100 sm:h-10 sm:border sm:border-white-100 sm:px-3',
        className,
      )}
      asChild
    >
      <a href={GOOGLE_AUTH_HREF} onClick={signIn}>
        <span className='contents sm:hidden'>
          <GoogleIcon />
          <span>Sign in with Google</span>
        </span>
        <span className='hidden text-[0.875rem] sm:contents'>Sign in</span>
      </a>
    </GhostButton>
  )
}
