import { cn } from '@/frontend/utils/cn'
import { Logo } from '@/frontend/ui'
import Link from 'next/link'

type LogoProps = {
  variant?: 'full' | 'sm'
  className?: string
}
export function LogoHomeLink({ variant, className }: LogoProps) {
  return (
    <Link href='/' className={cn('title-h2 outline-ring', className)}>
      <Logo
        variant={variant}
        className={cn({
          'inline-block w-[13rem] sm:w-[10.25rem]': variant === 'full',
        })}
      />
    </Link>
  )
}
