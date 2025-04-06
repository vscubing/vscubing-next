import { cn } from '@/app/_utils/cn'
import { type ReactNode } from 'react'
import { LoadingDots } from '../_components/ui/loading-dots'

export function LayoutPageTitleMobile({
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

export function LayoutPageTitleMobileFallback() {
  return (
    <div className='sr-only flex min-h-10 items-center lg:not-sr-only'>
      <LoadingDots />
    </div>
  )
}
