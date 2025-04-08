import { cn } from '@/app/_utils/cn'

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-2', className)}>
      <div className='h-3 w-3 animate-bounce rounded-full bg-grey-80 [animation-delay:-0.3s]'></div>
      <div className='h-3 w-3 animate-bounce rounded-full bg-grey-80 [animation-delay:-0.15s]'></div>
      <div className='h-3 w-3 animate-bounce rounded-full bg-grey-80'></div>
    </div>
  )
}
