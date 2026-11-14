import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-bold tracking-wide uppercase transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-sans [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        // PRD 4.4 Default / Primary: Signal Orange + bevel-button
        default:
          "bg-[#f68d1f] hover:bg-[#e48600] active:bg-[#e60012] text-white bevel-button shadow-sm",
        // PRD 4.4 Secondary: Carbon Navy (carbon-halftone) + white text
        secondary:
          "carbon-halftone text-white border border-[#3d4f97] hover:bg-[#3d4f97] hover:text-[#ecab37] bevel-button",
        // PRD 4.4 Amber Utility Chip: #ecab37 + bevel-button
        amber:
          "bg-[#ecab37] hover:bg-[#e48600] active:bg-[#f68d1f] text-[#21242e] bevel-button",
        // PRD 4.4 Outline: Chrome Indigo border + Canvas plate
        outline:
          "bg-[#7a8aba] text-[#21242e] border-2 border-[#3d4f97] hover:bg-[#9fbee7] bevel-button",
        // PRD 4.4 Ghost: Inset subtle hover effect
        ghost:
          "text-[#21242e] hover:bg-[#8ba1d4] hover:inset-plate-subtle",
        // Destructive
        destructive:
          "bg-[#e60012] hover:bg-[#c40010] text-white bevel-button",
        // Forward Action Round Disc
        disc:
          "rounded-full bg-[#f68d1f] hover:bg-[#e48600] text-white bevel-button flex items-center justify-center shadow-md",
        link: "text-[#3d4f97] underline-offset-4 hover:underline lowercase",
      },
      size: {
        default: "h-8 px-3 text-xs gap-1.5 rounded-[2px]",
        xs: "h-5 px-1.5 text-[9px] gap-1 rounded-[1px]",
        sm: "h-6.5 px-2 text-[10px] gap-1 rounded-[2px]",
        lg: "h-9 px-4 text-xs gap-2 rounded-[2px]",
        icon: "size-8 rounded-[2px]",
        "icon-sm": "size-6.5 rounded-[2px]",
        "icon-xs": "size-5 rounded-[1px]",
        "icon-disc": "size-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
