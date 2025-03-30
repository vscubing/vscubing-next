import { cn } from '@/app/_utils/cn'

type PlaceLabelProps = {
  children: number
  className?: string
}
export function PlaceLabel({ children: place, className }: PlaceLabelProps) {
  return (
    <span
      className={cn(
        'vertical-alignment-fix text-large flex h-11 w-11 items-center justify-center rounded-full border border-primary-60 sm:h-9 sm:w-9 sm:py-0',
        {
          'transition-base outline-ring hover:border-primary-80 active:border-primary-80 active:text-primary-80':
            false, // TODO: add scroll to result
        },
        className,
      )}
    >
      {place}
    </span>
  )
}
