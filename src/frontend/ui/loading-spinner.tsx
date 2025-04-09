import { cn } from '@/frontend/utils/cn'
import { type VariantProps, cva } from 'class-variance-authority'

const spinnerVariants = cva(
  'relative inline-block h-16 w-16 after:border-[#FF3D00]',
  {
    variants: { size: { sm: 'h-8 w-8', md: 'h-16 w-16', lg: 'h-24 w-24' } },
    defaultVariants: { size: 'md' },
  },
)

type LoadingSpinnerProps = {
  isVisible?: boolean
  className?: string
} & VariantProps<typeof spinnerVariants>
export function LoadingSpinner({
  isVisible = true,
  size,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, className }), {
        hidden: !isVisible,
      })}
    >
      <span className='absolute h-full w-full animate-[spinner-rotation_2s_ease-in-out_infinite] rounded-lg border-[3px] border-solid border-primary-100'></span>
      <span className='absolute h-full w-full animate-[spinner-rotation_2s_ease-in-out_infinite_1s] rounded-lg border border-solid border-secondary-20'></span>
    </div>
  )
}

export function LoadingSpinnerPage() {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <LoadingSpinner size='lg' />
    </div>
  )
}
