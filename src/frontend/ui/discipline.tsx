import { cn } from '@/frontend/utils/cn'
import { type HTMLAttributes } from 'react'
import { DisciplineIcon } from './icons'
import type { Discipline } from '@/types'

type DisciplineBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  discipline: Discipline
  size?: 'default' | 'sm'
}
export function DisciplineBadge({
  ref,
  discipline,
  size = 'default',
  className,
  ...props
}: DisciplineBadgeProps & {
  ref?: React.RefObject<HTMLDivElement>
}) {
  return (
    <span
      className={cn(
        'bg-secondary-20 text-black-100 inline-flex items-center justify-center',
        size === 'sm'
          ? 'h-10 w-10 rounded-lg'
          : 'h-15 w-15 rounded-xl sm:h-11 sm:w-11 sm:rounded-lg',
        className,
      )}
      aria-label={discipline.replace('by', ' by ')}
      ref={ref}
      {...props}
    >
      <DisciplineIcon discipline={discipline} />
    </span>
  )
}
