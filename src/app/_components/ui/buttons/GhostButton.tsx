import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/app/_utils/cn'
import { type ButtonHTMLAttributes } from 'react'

const ghostButtonVariants = cva(
  'transition-base outline-ring inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'rounded-xl text-white-100 disabled:text-grey-60',
      },
      size: {
        lg: 'btn-sm h-9 gap-2 border border-transparent px-2 hover:bg-grey-100 active:bg-grey-80 disabled:border-transparent disabled:bg-transparent sm:h-11',
        sm: 'btn-sm h-8 gap-3 px-2 hover:text-primary-60 active:text-primary-80',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
    },
  },
)

type GhostButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof ghostButtonVariants> & {
    asChild?: boolean
  }

function GhostButton({
  ref,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: GhostButtonProps & {
  ref?: React.RefObject<HTMLButtonElement>
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(ghostButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}

export { GhostButton }
