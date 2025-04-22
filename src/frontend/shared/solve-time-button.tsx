import { type VariantProps, cva } from 'class-variance-authority'
import Link from 'next/link'
import { type ComponentProps } from 'react'
import { formatSolveTime } from '../../utils/format-solve-time'
import { cn } from '../utils/cn'
import { WatchSolveHintPopover } from './watch-solve-hint-popover.client'
import { type Discipline, type ResultDnfable } from '../../types'
import confettiImg from '@/../public/images/confetti-solve-time-link.svg'
import Image from 'next/image'
import { ExtraLabel } from './extra-label'

const solveTimeLinkOrDnfVariants = cva(
  'transition-base outline-ring after-border-bottom vertical-alignment-fix inline-flex h-8 min-w-24 items-center justify-center hover:after:scale-x-100 lg:min-w-20',
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

type SolveTimeLinkOrDnfProps = VariantProps<
  typeof solveTimeLinkOrDnfVariants
> & {
  result: ResultDnfable
  solveId: number
  contestSlug: string
  discipline: Discipline
  canShowHint: boolean
  isFestive?: boolean
  extraNumber?: '1' | '2'
  className?: string
  backgroundColorClass?: string
}

export function SolveTimeLinkOrDnf({
  result,
  variant,
  className,
  contestSlug,
  solveId,
  canShowHint,
  isFestive = false,
  extraNumber,
  discipline,
  backgroundColorClass,
}: SolveTimeLinkOrDnfProps) {
  if (result.isDnf) {
    return <SolveTimeLabel isDnf className={className} />
  }
  return (
    <WatchSolveHintPopover disabled={!canShowHint}>
      <Link
        href={`/contests/${contestSlug}/watch/${solveId}?discipline=${discipline}`}
        className={cn(solveTimeLinkOrDnfVariants({ variant, className }))}
      >
        {isFestive && (
          <Image
            src={confettiImg}
            alt=''
            className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          />
        )}
        <span className='relative'>
          <span className='absolute top-[-0.9rem] flex min-w-full items-center'>
            {extraNumber !== undefined && (
              <ExtraLabel
                extraNumber={extraNumber}
                className={cn('-ml-1 rounded px-1', backgroundColorClass)}
              />
            )}
            {result.plusTwoIncluded && (
              <span
                className={cn(
                  'caption -mr-1 ml-auto rounded px-1',
                  backgroundColorClass,
                )}
              >
                (+2)
              </span>
            )}
          </span>
          <span>{formatSolveTime(result.timeMs)}</span>
        </span>
      </Link>
    </WatchSolveHintPopover>
  )
}

const solveTimeLabelVariants = cva(
  'vertical-alignment-fix relative inline-flex h-8 min-w-24 items-center justify-center lg:min-w-20',
  {
    variants: {
      variant: { average: 'text-yellow-100', dnf: 'text-red-80' },
    },
  },
)
type SolveTimeLabelProps = {
  timeMs?: number // this is loosely typed without ResultDnfable because isPlaceholder and isAverage are tricky
  isDnf?: boolean
  isPlaceholder?: boolean
  isFestive?: boolean
  isAverage?: boolean
} & Omit<ComponentProps<'span'>, 'children'>
export function SolveTimeLabel({
  ref,
  timeMs,
  isDnf = false,
  isPlaceholder = false,
  isFestive = false,
  isAverage,
  className,
  ...props
}: SolveTimeLabelProps & {
  ref?: React.RefObject<HTMLSpanElement>
}) {
  let variant: 'average' | 'dnf' | undefined

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
      {isFestive && (
        <Image
          src={confettiImg}
          alt=''
          className='pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2'
        />
      )}
      {content}
    </span>
  )
}
