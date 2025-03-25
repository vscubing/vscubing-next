import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
    forwardRef,
    type ElementRef,
    type ComponentPropsWithoutRef,
} from "react";
import {
    BaseDialogButton,
    baseDialogContent,
    baseDialogFooter,
    baseDialogOverlay,
    baseDialogOverlayInner,
    baseDialogTitle,
} from "./BaseDialog";
import { cn } from "@/app/_utils/cn";
import type { SetOptional } from "@/app/_utils/types";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogDescription = AlertDialogPrimitive.Description;

const AlertDialogOverlay = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(baseDialogOverlay, className)}
    {...props}
    ref={ref}
  >
    <div className={baseDialogOverlayInner}></div>
  </AlertDialogPrimitive.Overlay>
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Content
    ref={ref}
    className={cn(baseDialogContent, className)}
    {...props}
  />
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogTitle = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(baseDialogTitle, className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogAction = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Action>,
  SetOptional<ComponentPropsWithoutRef<typeof BaseDialogButton>, "version">
>(({ version = "primary", ...props }, ref) => (
  <AlertDialogPrimitive.Action asChild>
    <BaseDialogButton version={version} ref={ref} {...props} />
  </AlertDialogPrimitive.Action>
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = forwardRef<
  ElementRef<typeof AlertDialogPrimitive.Cancel>,
  SetOptional<ComponentPropsWithoutRef<typeof BaseDialogButton>, "version">
>(({ version = "secondary", ...props }, ref) => (
  <AlertDialogPrimitive.Cancel asChild>
    <BaseDialogButton version={version} ref={ref} {...props} />
  </AlertDialogPrimitive.Cancel>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

const AlertDialogFooter = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) => (
  <div className={cn(baseDialogFooter, className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

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
};
