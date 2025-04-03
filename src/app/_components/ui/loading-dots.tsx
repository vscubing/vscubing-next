import { cn } from '@/app/_utils/cn'

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex animate-pulse space-x-2', className)}>
      <div className='h-3 w-3 rounded-full bg-grey-80'></div>
      <div className='h-3 w-3 rounded-full bg-grey-80'></div>
      <div className='h-3 w-3 rounded-full bg-grey-80'></div>
    </div>
  )
}
