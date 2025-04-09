import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/frontend/utils/cn'
import { type ButtonHTMLAttributes } from 'react'

const underlineButtonVariants = cva(
  'transition-base outline-ring inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default:
          'border-b border-current py-1 text-primary-80 hover:text-primary-60 active:text-primary-80 disabled:text-grey-60',
      },
      size: {
        lg: 'btn-lg',
        sm: 'btn-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
    },
  },
)

type UnderlineButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof underlineButtonVariants> & {
    asChild?: boolean
  }

function UnderlineButton({
  ref,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: UnderlineButtonProps & {
  ref?: React.RefObject<HTMLButtonElement>
}) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(underlineButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}

export { UnderlineButton }
