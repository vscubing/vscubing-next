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
    <span className={cn('caption-sm text-nowrap text-red-80', className)}>
      Extra {extraNumber}
    </span>
  )
}
