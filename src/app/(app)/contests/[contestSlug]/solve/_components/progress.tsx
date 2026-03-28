import { cn } from '@/frontend/utils/cn'

export function Progress({
  className,
  currentSolveNumber,
}: {
  className: string
  currentSolveNumber: number
}) {
  return (
    <div
      className={cn(
        'after:bg-solve-contest-progress-divider relative flex flex-col after:absolute after:top-0 after:left-1/2 after:h-full after:w-1 after:-translate-x-1/2 after:bg-center after:bg-repeat-y',
        className,
      )}
    >
      {[1, 2, 3, 4, 5].map((number) => (
        <span
          key={number}
          className={cn(
            'border-grey-60 bg-black-80 text-grey-60 ring-black-80 z-10 flex h-11 min-h-11 w-11 items-center justify-center rounded-full border ring duration-1000 ease-in-out',
            {
              'border-primary-80 bg-primary-80 text-black-100':
                number < currentSolveNumber,
              'border-primary-80 text-primary-80':
                number === currentSolveNumber,
            },
          )}
        >
          {number}
        </span>
      ))}
    </div>
  )
}
