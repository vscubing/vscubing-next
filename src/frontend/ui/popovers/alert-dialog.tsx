import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { type ComponentRef, type ComponentPropsWithoutRef } from 'react'
import {
  BaseDialogButton,
  baseDialogContent,
  baseDialogFooter,
  baseDialogOverlay,
  baseDialogOverlayInner,
  baseDialogTitle,
} from './base-dialog'
import { cn } from '@/frontend/utils/cn'
import type { SetOptional } from '@/lib/utils/set-optional'

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogDescription = AlertDialogPrimitive.Description

function AlertDialogOverlay({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> & {
  ref?: React.RefObject<ComponentRef<typeof AlertDialogPrimitive.Overlay>>
}) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(baseDialogOverlay, className)}
      {...props}
      ref={ref}
    >
      <div className={baseDialogOverlayInner}></div>
    </AlertDialogPrimitive.Overlay>
  )
}

function AlertDialogContent({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
  ref?: React.RefObject<ComponentRef<typeof AlertDialogPrimitive.Content>>
}) {
  return (
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(baseDialogContent, className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> & {
  ref?: React.RefObject<ComponentRef<typeof AlertDialogPrimitive.Title>>
}) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn(baseDialogTitle, className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  ref,
  version = 'primary',
  ...props
}: SetOptional<ComponentPropsWithoutRef<typeof BaseDialogButton>, 'version'> & {
  ref?: React.RefObject<ComponentRef<typeof AlertDialogPrimitive.Action>>
}) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <BaseDialogButton version={version} ref={ref} {...props} />
    </AlertDialogPrimitive.Action>
  )
}

function AlertDialogCancel({
  ref,
  version = 'secondary',
  ...props
}: SetOptional<ComponentPropsWithoutRef<typeof BaseDialogButton>, 'version'> & {
  ref?: React.RefObject<ComponentRef<typeof AlertDialogPrimitive.Cancel>>
}) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <BaseDialogButton version={version} ref={ref} {...props} />
    </AlertDialogPrimitive.Cancel>
  )
}

const AlertDialogFooter = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn(baseDialogFooter, className)} {...props} />
)

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogDescription,
}
