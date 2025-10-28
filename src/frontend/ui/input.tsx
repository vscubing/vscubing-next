import { cn } from '@/frontend/utils/cn'
import { type ComponentProps, type RefCallback } from 'react'

export type InputProps = ComponentProps<'input'> & {
  error?: boolean
}

function Input({
  ref,
  className,
  error = false,
  ...props
}: InputProps & {
  ref?: RefCallback<HTMLInputElement> | React.RefObject<HTMLInputElement>
}) {
  return (
    <input
      className={cn(
        'h-11 max-w-[calc(100%-0.5rem)] rounded-lg bg-black-100 px-4 text-base placeholder-grey-40 ring-grey-40 transition-shadow duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1',
        { 'ring-1 ring-red-80': error },
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

export type TextAreaProps = ComponentProps<'textarea'> & {
  error?: boolean
}

function TextArea({
  ref,
  className,
  error = false,
  ...props
}: TextAreaProps & {
  ref?: RefCallback<HTMLInputElement> | React.RefObject<HTMLInputElement>
}) {
  return (
    <textarea
      className={cn(
        'rounded-lg bg-black-100 px-4 py-[0.625rem] text-base placeholder-grey-40 ring-grey-40 transition-shadow duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1',
        { 'ring-1 ring-red-80': error },
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Input, TextArea }
