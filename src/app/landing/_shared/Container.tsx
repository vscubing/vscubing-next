import { cn } from '@/frontend/utils/cn'
import type { ReactNode } from 'react'

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className='px-[1.625rem] md:px-4'>
      <div className={cn('mx-auto max-w-[80rem]', className)}>{children}</div>
    </div>
  )
}
