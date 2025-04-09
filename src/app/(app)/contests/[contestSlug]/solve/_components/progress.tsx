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
        'relative flex flex-col after:absolute after:left-1/2 after:top-0 after:h-full after:w-1 after:-translate-x-1/2 after:bg-solve-contest-progress-divider after:bg-center after:bg-repeat-y',
        className,
      )}
    >
      {[1, 2, 3, 4, 5].map((number) => (
        <span
          key={number}
          className={cn(
            'z-10 flex h-11 min-h-11 w-11 items-center justify-center rounded-full border border-grey-60 bg-black-80 text-grey-60 ring ring-black-80 duration-1000 ease-in-out',
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
