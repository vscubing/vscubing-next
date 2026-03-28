import { type ReactNode } from 'react'
import { cn } from '@/frontend/utils/cn'

type SectionHeaderProps = { children: ReactNode; className?: string }
export function LayoutSectionHeader({
  children,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'bg-black-80 flex h-[var(--layout-section-header-height)] shrink-0 items-center rounded-2xl px-4 sm:p-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
