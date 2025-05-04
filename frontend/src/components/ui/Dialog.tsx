// src/components/ui/dialog.tsx
import { forwardRef, ReactNode } from "react"
import * as RadixDialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger

export const DialogPortal = ({ children }: { children: ReactNode }) => (
  <RadixDialog.Portal>{children}</RadixDialog.Portal>
)

export const DialogOverlay = forwardRef<
  HTMLDivElement,
  RadixDialog.DialogOverlayProps
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-20 bg-black/50 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))

export const DialogContent = forwardRef<
  HTMLDivElement,
  RadixDialog.DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg",
        "dark:bg-gray-800 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
      <RadixDialog.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100">
        ✕
      </RadixDialog.Close>
    </RadixDialog.Content>
  </DialogPortal>
))

export const DialogHeader = ({ children }: { children: ReactNode }) => (
  <div className="mb-4 flex flex-col space-y-1">{children}</div>
)
export const DialogTitle = forwardRef<HTMLHeadingElement, { children: ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <RadixDialog.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </RadixDialog.Title>
  )
)
export const DialogDescription = forwardRef<HTMLParagraphElement, { children: ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <RadixDialog.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </RadixDialog.Description>
  )
)
