import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "text-[#21242e] transition-all relative font-sans",
  {
    variants: {
      variant: {
        // 기본 섀시 베벨 플레이트
        default: "bg-[#7a8aba] bevel-plate",
        // 45도 챔퍼드 코너 + 베벨 결합
        chamfered: "bg-[#7a8aba] bevel-plate chamfered-box",
        // 소프트 플레이트
        soft: "bg-[#9fbee7] bevel-plate-light",
        // 인셋 음각 플레이트 (리스트 슬롯 등)
        inset: "bg-[#dedede] inset-plate-subtle",
        // 깊은 음각 웰
        "inset-deep": "bg-[#dedede] inset-plate",
        // 카본 네이비 슬래브
        carbon: "carbon-halftone border border-[#3d4f97] text-white",
        // 페리윙클 패널
        periwinkle: "bg-[#8ba1d4] bevel-plate",
        // 순백색 플레이트
        white: "bg-white bevel-plate",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

function CardHeader({
  className,
  decorated = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { decorated?: boolean }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1 p-2 sm:p-2.5",
        decorated && "border-b border-[#3d4f97]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-xs sm:text-[13px] font-extrabold text-[#21242e] leading-snug uppercase tracking-wide",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[10px] sm:text-[11px] text-[#21242e]/75 leading-tight", className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-2 sm:p-2.5 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between p-2 sm:p-2.5 pt-0 text-[10px] font-mono",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}
