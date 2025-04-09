import { cn } from '@/frontend/utils/cn'
import { type ReactNode } from 'react'
import { LoadingDots } from '../ui/loading-dots'

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
        'title-h2 hidden min-h-10 text-secondary-20 lg:block sm:min-h-[1.875rem]',
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function LayoutPageTitleMobileFallback() {
  return (
    <div className='hidden h-10 items-center lg:flex sm:h-[1.875rem]'>
      <LoadingDots />
    </div>
  )
}
