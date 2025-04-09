import { type VariantProps, cva } from 'class-variance-authority'
import Link from 'next/link'
import { type ComponentProps } from 'react'
import { formatSolveTime } from '../_utils/formatSolveTime'
import { cn } from '../_utils/cn'
import { WatchSolveHintPopover } from './watch-solve-hint-popover.client'
import type { Discipline, ResultDnfish } from '../../types'

const solveTimeButtonVariants = cva(
  'transition-base outline-ring after-border-bottom vertical-alignment-fix inline-flex h-8 min-w-24 items-center justify-center hover:after:scale-x-100',
  {
    variants: {
      variant: {
        default: 'active:text-grey-20',
        worst: 'text-red-80 active:text-red-100',
        best: 'text-primary-80 active:text-primary-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type SolveTimeLinkOrDnfProps = VariantProps<typeof solveTimeButtonVariants> & {
  result: ResultDnfish
  solveId: number
  contestSlug: string
  discipline: Discipline
  canShowHint: boolean
  className?: string
}

export function SolveTimeLinkOrDnf({
  result,
  variant,
  className,
  contestSlug,
  solveId,
  canShowHint,
  discipline,
}: SolveTimeLinkOrDnfProps) {
  if (result.isDnf) {
    return <SolveTimeLabel isDnf className={className} />
  }
  return (
    <WatchSolveHintPopover disabled={!canShowHint}>
      <Link
        href={`/contests/${contestSlug}/watch/${solveId}?discipline=${discipline}`}
        className={cn(solveTimeButtonVariants({ variant, className }))}
      >
        {formatSolveTime(result.timeMs)}
      </Link>
    </WatchSolveHintPopover>
  )
}

const solveTimeLabelVariants = cva(
  'vertical-alignment-fix inline-flex h-8 min-w-24 items-center justify-center',
  {
    variants: {
      variant: { average: 'text-yellow-100', dnf: 'text-red-80' },
    },
  },
)
type SolveTimeLabelProps = {
  timeMs?: number
  isDnf?: boolean
  isPlaceholder?: boolean
  isAverage?: boolean
} & Omit<ComponentProps<'span'>, 'children'>
export function SolveTimeLabel({
  ref,
  timeMs,
  isDnf = false,
  isPlaceholder = false,
  isAverage,
  className,
  ...props
}: SolveTimeLabelProps & {
  ref?: React.RefObject<HTMLSpanElement>
}) {
  let variant: 'average' | 'dnf' | undefined

  if (timeMs === 2147483647) {
    isDnf = true
  }

  if (isDnf) {
    variant = 'dnf'
  } else if (isAverage) {
    variant = 'average'
  }

  let content = ''
  if (isPlaceholder) {
    content = '00:00.000'
  } else if (isDnf) {
    content = 'DNF'
  } else {
    content = formatSolveTime(timeMs!)
  }

  return (
    <span
      {...props}
      className={cn(solveTimeLabelVariants({ variant, className }))}
      ref={ref}
    >
      {content}
    </span>
  )
}
