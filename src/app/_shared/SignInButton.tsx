'use client'

import { cn } from '@/app/_utils/cn'
import { GhostButton, GoogleIcon, PrimaryButton } from '@/app/_components/ui'
import Link from 'next/link'

type SignInButtonProps = { variant: 'primary' | 'ghost'; className?: string }
export function SignInButton({ variant, className }: SignInButtonProps) {
  if (variant === 'primary') {
    return (
      <PrimaryButton
        className={cn('h-12 gap-3 px-4 text-[1.125rem] sm:h-12', className)}
        asChild
      >
        <Link href='/api/auth/google'>
          <GoogleIcon />
          Sign in with Google
        </Link>
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
      <Link href='/api/auth/google'>
        <span className='contents sm:hidden'>
          <GoogleIcon />
          <span>Sign in with Google</span>
        </span>
        <span className='hidden text-[0.875rem] sm:contents'>Sign in</span>
      </Link>
    </GhostButton>
  )
}
