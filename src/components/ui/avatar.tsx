import * as React from "react";
import Image, { ImageProps } from "next/image";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "@/lib/utils";

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  shape?: "circle" | "rounded" | "squircle";
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-9 h-9",
  md: "w-11 h-11",
  lg: "w-16 h-16 sm:w-20 sm:h-20",
  xl: "w-24 h-24 sm:w-28 sm:h-28",
};

const shapeClasses = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  squircle: "rounded-[22px]",
};

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, shape = "circle", size = "lg", ...props }, ref) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden bg-[#e8f3ff] border border-[#e5e8eb] shadow-sm select-none",
          sizeClasses[size],
          shapeClasses[shape],
          className
        )}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

function AvatarImage({
  src,
  alt = "Avatar",
  width = 96,
  height = 96,
  className,
  ...props
}: ImageProps) {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("w-full h-full object-cover select-none", className)}
        {...props}
      />
    </div>
  );
}

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ children, className, ...props }, ref) => {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center bg-[#e8f3ff] text-[#3182f6] text-sm font-bold",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
