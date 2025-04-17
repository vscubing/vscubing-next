import { LoadingDots } from '@/frontend/ui/loading-dots'
import { cn } from '@/frontend/utils/cn'
import { type ReactNode } from 'react'

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
        'title-h2 hidden min-h-[1.875rem] text-secondary-20 sm:block',
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function LayoutPageTitleMobileFallback() {
  return (
    <div className='hidden h-10 items-center sm:flex sm:h-[1.875rem]'>
      <LoadingDots />
    </div>
  )
}
