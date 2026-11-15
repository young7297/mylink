"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Backdrop>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Backdrop
    ref={ref}
    data-slot="dialog-backdrop"
    className={cn(
      "fixed inset-0 z-50 min-h-dvh bg-[#191f28]/45 backdrop-blur-[2px] transition-all duration-200",
      "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-ending-style:opacity-0 data-starting-style:opacity-0",
      className
    )}
    {...props}
  />
));
DialogBackdrop.displayName = "DialogBackdrop";

const DialogPopup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Popup>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Popup
    ref={ref}
    data-slot="dialog-popup"
    className={cn(
      "fixed top-1/2 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl bg-white p-6 shadow-toss-3 border border-[#e5e8eb] max-h-[90vh] overflow-y-auto transition-all duration-200 ease-out",
      "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
      "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
      className
    )}
    {...props}
  />
));
DialogPopup.displayName = "DialogPopup";

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Popup> {
  showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, ...props }, ref) => (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPopup ref={ref} className={className} {...props}>
        {children}
        {showCloseButton && (
          <DialogClose
            className="absolute top-5 right-5 size-8 rounded-full flex items-center justify-center text-[#8b95a1] hover:text-[#191f28] hover:bg-[#f2f4f6] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3182f6]"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </DialogClose>
        )}
      </DialogPopup>
    </DialogPortal>
  )
);
DialogContent.displayName = "DialogContent";

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 text-left mb-4", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#e5e8eb]/80",
        className
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn(
      "text-lg sm:text-xl font-bold text-[#191f28] tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-xs sm:text-sm text-[#6b7684] leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
