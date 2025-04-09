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

type DisciplineSwitcherProps = {
  className?: string
  asButton?: boolean
  isActive?: boolean
  discipline: string
}
export function DisciplineSwitcherItem({
  ref,
  className,
  isActive,
  discipline,
  asButton = true,
  ...props
}: DisciplineSwitcherProps & {
  ref?: React.RefObject<HTMLButtonElement>
}) {
  const Comp = asButton ? 'button' : 'span'
  return (
    <Comp ref={ref} {...props}>
      <DisciplineBadge
        className={cn(
          'transition-base outline-ring cursor-pointer border border-transparent bg-grey-100 text-grey-60 hover:border-secondary-20 active:bg-secondary-20 active:text-black-100',
          { 'bg-secondary-20 text-black-100': isActive },
          className,
        )}
        discipline={discipline}
      />
    </Comp>
  )
}
