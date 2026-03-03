import { cn } from '@/frontend/utils/cn'
export function ExtraLabel({
  extraNumber,
  className,
}: {
  extraNumber?: '1' | '2'
  className?: string
}) {
  if (extraNumber === undefined) {
    return null
  }
  return (
    <span className={cn('caption-sm text-red-80 text-nowrap', className)}>
      Extra {extraNumber}
    </span>
  )
}
