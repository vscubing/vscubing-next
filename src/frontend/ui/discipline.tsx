import { cn } from '@/frontend/utils/cn'
import { type HTMLAttributes } from 'react'
import { DisciplineIcon } from './icons'

type DisciplineBadgeProps = HTMLAttributes<HTMLDivElement> & {
  discipline: string
}
export function DisciplineBadge({
  ref,
  discipline,
  className,
  ...props
}: DisciplineBadgeProps & {
  ref?: React.RefObject<HTMLDivElement>
}) {
  return (
    <span
      className={cn(
        'inline-flex h-15 w-15 items-center justify-center rounded-xl bg-secondary-20 text-black-100 sm:h-11 sm:w-11 sm:rounded-lg',
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
