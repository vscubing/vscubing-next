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
    <h1
      className={cn(
        'title-h2 sr-only min-h-10 text-secondary-20 lg:not-sr-only',
        className,
      )}
    >
      {children}
    </h1>
  )
}
