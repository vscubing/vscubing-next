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
        'bg-black-100 placeholder-grey-40 ring-grey-40 h-11 rounded-lg px-4 text-base transition-shadow duration-200 ease-in-out focus-visible:ring-1 focus-visible:outline-none',
        { 'ring-red-80 ring-1': error },
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
        'bg-black-100 placeholder-grey-40 ring-grey-40 rounded-lg px-4 py-[0.625rem] text-base transition-shadow duration-200 ease-in-out focus-visible:ring-1 focus-visible:outline-none',
        { 'ring-red-80 ring-1': error },
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Input, TextArea }
