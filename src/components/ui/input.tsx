import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full text-xs font-sans text-[#21242e] transition-all outline-none disabled:pointer-events-none disabled:opacity-50 placeholder:text-[#21242e]/50",
  {
    variants: {
      variant: {
        // 기본 음각 인셋 웰
        default:
          "bg-white inset-plate-subtle focus:border-[#f68d1f] focus:ring-1 focus:ring-[#f68d1f]",
        // 깊은 음각 웰
        deep:
          "bg-white inset-plate focus:border-[#f68d1f] focus:ring-1 focus:ring-[#f68d1f]",
        // 페리윙클 웰
        periwinkle:
          "bg-[#8ba1d4] inset-plate-subtle text-[#21242e] focus:bg-white focus:ring-1 focus:ring-[#f68d1f]",
      },
      sizeVariant: {
        default: "h-8 px-2.5 py-1.5",
        sm: "h-7 px-2 py-1 text-[11px]",
        lg: "h-9 px-3 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      sizeVariant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, variant, sizeVariant, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, sizeVariant, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
