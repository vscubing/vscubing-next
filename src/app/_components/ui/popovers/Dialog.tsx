import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/app/_utils/cn'
import { type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import {
  BaseDialogButton,
  baseDialogContent,
  baseDialogFooter,
  baseDialogOverlay,
  baseDialogOverlayInner,
  baseDialogTitle,
} from './BaseDialog'
import { SecondaryButton } from '../buttons'
import { CloseIcon } from '../icons'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogDescription = DialogPrimitive.Description

function DialogOverlay({
  ref,
  className,
  withCubes = true,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Overlay>>
  withCubes?: boolean
}) {
  return (
    <DialogPrimitive.Overlay
      className={cn(baseDialogOverlay, className)}
      {...props}
      ref={ref}
    >
      {withCubes && <div className={cn(baseDialogOverlayInner)}></div>}
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Content>>
}) {
  return (
    <DialogPrimitive.Content
      ref={ref}
      className={cn(baseDialogContent, className)}
      {...props}
    />
  )
}

function DialogTitle({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Title>>
}) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(baseDialogTitle, className)}
      {...props}
    />
  )
}

function DialogCloseCross({
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof SecondaryButton> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Close>>
}) {
  return (
    <DialogPrimitive.Close asChild>
      <SecondaryButton size='iconSm' ref={ref} {...props}>
        <CloseIcon />
      </SecondaryButton>
    </DialogPrimitive.Close>
  )
}

function DialogClose({
  ref,
  version,
  ...props
}: ComponentPropsWithoutRef<typeof BaseDialogButton> & {
  ref?: React.RefObject<ComponentRef<typeof DialogPrimitive.Close>>
}) {
  return (
    <DialogPrimitive.Close asChild>
      <BaseDialogButton version={version} ref={ref} {...props} />
    </DialogPrimitive.Close>
  )
}

const DialogFooter = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn(baseDialogFooter, className)} {...props} />
)

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogCloseCross,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
