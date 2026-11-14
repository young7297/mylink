import * as React from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "chamfered" | "square" | "circle"
  size?: "sm" | "md" | "lg" | "xl"
}

const shapeStyles = {
  chamfered: {
    clipPath:
      "polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)",
  },
  square: {},
  circle: {
    borderRadius: "9999px",
  },
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20 sm:w-24 sm:h-24",
  xl: "w-28 h-28 sm:w-32 sm:h-32",
}

function Avatar({
  className,
  shape = "chamfered",
  size = "lg",
  style,
  ...props
}: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      style={{ ...shapeStyles[shape], ...style }}
      className={cn(
        "relative shrink-0 overflow-hidden bg-white border-2 border-[#3d4f97] p-1 shadow-inner",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  src,
  alt = "Avatar",
  width = 96,
  height = 96,
  className,
  ...props
}: ImageProps) {
  return (
    <div className="w-full h-full relative bg-[#acace7]/20 flex items-center justify-center overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("w-full h-full object-contain select-none", className)}
        {...props}
      />
    </div>
  )
}

function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center bg-[#8ba1d4] text-xs font-bold uppercase text-[#21242e]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
