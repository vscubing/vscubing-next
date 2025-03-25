import { cn } from '@/app/_utils/cn'
import { type ReactNode } from 'react'

export function PageTitleMobile({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h1 className={cn('title-h2 hidden text-secondary-20 lg:block', className)}>
      {children}
    </h1>
  )
}
