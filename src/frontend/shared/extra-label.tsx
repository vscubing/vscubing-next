import { cn } from '@/frontend/utils/cn'
import { isExtra, type ScramblePosition } from '../../types'

export function ExtraLabel({
  scramblePosition,
  className,
}: {
  scramblePosition: ScramblePosition
  className?: string
}) {
  if (!isExtra(scramblePosition)) {
    return null
  }
  const extraNumber = scramblePosition[1]
  return (
    <span className={cn('caption-sm text-red-80', className)}>
      Extra {extraNumber}
    </span>
  )
}
