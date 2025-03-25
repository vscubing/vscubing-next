import { cn } from '@/app/_utils/cn'
import { forwardRef, type ComponentProps } from 'react'

export type InputProps = ComponentProps<'input'> & {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <input
        className={cn(
          'text-large h-11 rounded-lg bg-black-100 px-4 placeholder-grey-40 ring-grey-40 transition-shadow duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1',
          { 'ring-1 ring-red-80': error },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export type TextAreaProps = ComponentProps<'textarea'> & {
  error?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'text-large rounded-lg bg-black-100 px-4 py-[0.625rem] placeholder-grey-40 ring-grey-40 transition-shadow duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1',
          { 'ring-1 ring-red-80': error },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
TextArea.displayName = 'TextArea'

export { Input, TextArea }
