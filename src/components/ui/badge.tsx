import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center font-extrabold uppercase tracking-wider select-none font-sans transition-colors",
  {
    variants: {
      variant: {
        // PRD 4.4 Amber Silkscreen
        default:
          "bg-[#ecab37] text-[#21242e] border border-black/20",
        // Signal Action
        signal:
          "bg-[#f68d1f] text-white border border-white/30",
        // Carbon Navy
        carbon:
          "bg-[#21242e] text-[#ecab37] border border-[#ecab37]/40",
        // Indigo Chrome
        indigo:
          "bg-[#3d4f97] text-white border border-[#b8c7ee]/40",
        // Periwinkle
        periwinkle:
          "bg-[#8ba1d4] text-[#21242e] border border-[#3d4f97]",
        // Platinum Inset
        platinum:
          "bg-[#dedede] text-[#21242e] border border-[#3d4f97]/40",
        // Destructive / Hot
        destructive:
          "bg-[#e60012] text-white border border-white/20",
        // Outline
        outline:
          "border border-[#3d4f97] text-[#3d4f97] bg-white/40",
      },
      size: {
        default: "text-[9px] px-1.5 py-0.2 rounded-[1px]",
        xs: "text-[8px] px-1 py-0.2 rounded-[1px]",
        sm: "text-[9px] px-1.5 py-0.5 rounded-[2px]",
        md: "text-[10px] px-2 py-0.5 rounded-[2px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
