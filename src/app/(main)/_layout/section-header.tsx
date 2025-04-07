import { type ReactNode } from 'react'
import { cn } from '@/app/_utils/cn'

type SectionHeaderProps = { children: ReactNode; className?: string }
export function LayoutSectionHeader({
  children,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-[var(--section-header-height)] shrink-0 items-center rounded-2xl bg-black-80 px-4 sm:p-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
