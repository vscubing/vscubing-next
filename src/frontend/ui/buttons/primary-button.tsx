import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/frontend/utils/cn'
import { type ButtonHTMLAttributes } from 'react'

const primaryButtonVariants = cva(
  'transition-base outline-ring inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default:
          'rounded-xl bg-primary-80 text-black-100 hover:bg-primary-60 active:bg-primary-80 disabled:bg-grey-40 disabled:text-grey-60',
      },
      size: {
        lg: 'btn-lg h-15 px-6 sm:h-14',
        sm: 'btn-sm h-11 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
    },
  },
)

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof primaryButtonVariants> & {
    asChild?: boolean
  }

function PrimaryButton({
  ref,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: PrimaryButtonProps & {
  ref?: React.RefObject<HTMLButtonElement>
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(primaryButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}

export { PrimaryButton }
