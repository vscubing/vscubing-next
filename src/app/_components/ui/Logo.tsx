import { type ComponentPropsWithoutRef } from 'react'
import logoFullImg from '@/app/_assets/images/logo-full.svg?url'
import logoSmImg from '@/app/_assets/images/logo-sm.svg?url'
import { cn } from '@/app/_utils/cn'
import Image from 'next/image'
import { env } from '@/env'

const LOGO_VARIANTS = {
  full: logoFullImg,
  sm: logoSmImg,
} as const

export function Logo({
  variant = 'sm',
  className,
  ...props
}: ComponentPropsWithoutRef<'span'> & {
  variant?: keyof typeof LOGO_VARIANTS
}) {
  return (
    <span {...props} className={cn('relative', className)}>
      <Image
        src={LOGO_VARIANTS[variant]}
        className='h-full w-full'
        alt='vscubing - Virtual Speedcubing'
      />
      {env.NEXT_PUBLIC_NODE_ENV === 'development' && (
        <span className='title-h1 absolute top-0 text-white-100'>DEV</span>
      )}
      {env.NEXT_PUBLIC_NODE_ENV === 'test' && (
        <span className='title-h1 absolute top-0 text-white-100'>TEST</span>
      )}
    </span>
  )
}
