import { cn } from '@/frontend/utils/cn'

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-2', className)}>
      <div className='bg-grey-80 h-3 w-3 animate-bounce rounded-full [animation-delay:-0.3s]'></div>
      <div className='bg-grey-80 h-3 w-3 animate-bounce rounded-full [animation-delay:-0.15s]'></div>
      <div className='bg-grey-80 h-3 w-3 animate-bounce rounded-full'></div>
    </div>
  )
}
