'use client'

import {
  Popover,
  PopoverAnchor,
  PopoverCloseButton,
  PopoverContent,
} from '@/app/_components/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import Link from 'next/link'
import { type ReactNode, forwardRef, type ComponentProps } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { formatSolveTime } from '../_utils/formatSolveTime'
import { useIsTouchDevice } from '../_utils/useMediaQuery'
import { cn } from '../_utils/cn'

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
  timeMs: number | null
  isDnf: boolean
  contestSlug: string
  discipline: string
  solveId: number
  canShowHint: boolean
  className?: string
}

export function SolveTimeLinkOrDnf({
  timeMs,
  isDnf,
  variant,
  className,
  contestSlug,
  discipline,
  solveId,
  canShowHint,
}: SolveTimeLinkOrDnfProps) {
  if (isDnf || !timeMs) {
    return <SolveTimeLabel isDnf className={className} />
  }
  return (
    <WatchSolveHintPopover disabled={!canShowHint}>
      <Link
        href={`/contests/${contestSlug}/watch/${solveId}?discipline=${discipline}`}
        className={cn(solveTimeButtonVariants({ variant, className }))}
      >
        {formatSolveTime(timeMs)}
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
export const SolveTimeLabel = forwardRef<HTMLSpanElement, SolveTimeLabelProps>(
  (
    {
      timeMs,
      isDnf = false,
      isPlaceholder = false,
      isAverage,
      className,
      ...props
    },
    ref,
  ) => {
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
  },
)
SolveTimeLabel.displayName = 'SolveTimeLabel'

type WatchSolveHintPopoverProps = {
  children: ReactNode
  className?: string
  disabled: boolean
}
export function WatchSolveHintPopover({
  children,
  disabled,
}: WatchSolveHintPopoverProps) {
  const isTouchDevice = useIsTouchDevice()
  const [seenHint, setSeenHint] = useLocalStorage(
    'vs-seenWatchSolveHint',
    false,
  )

  function handleClose() {
    setSeenHint(true)
  }

  return (
    <Popover open={!seenHint && !disabled}>
      <PopoverContent>
        <p>
          {isTouchDevice
            ? 'Tap on a time result to watch the solution'
            : 'Click on a time result to watch the solution'}
        </p>
        <PopoverCloseButton onClick={handleClose} />
      </PopoverContent>

      <PopoverAnchor asChild onClick={handleClose}>
        {children}
      </PopoverAnchor>
    </Popover>
  )
}
