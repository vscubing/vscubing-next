import { type ReactNode } from 'react'
import { cn } from '@/app/_utils/cn'

type SectionHeaderProps = { children: ReactNode; className?: string }
export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-[5.75rem] items-center rounded-2xl bg-black-80 px-4 sm:h-auto sm:p-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
