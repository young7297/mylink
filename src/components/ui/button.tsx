import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-semibold transition-all outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 cursor-pointer font-sans [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // TDS Primary (화면당 하나만 사용하는 메인 Toss Blue)
        primary:
          "bg-[#3182f6] hover:bg-[#256cd8] active:bg-[#1b56b3] text-white shadow-sm",
        // TDS Secondary (보조 액션용 연회색)
        secondary:
          "bg-[#f2f4f6] hover:bg-[#e5e8eb] active:bg-[#d1d6db] text-[#191f28]",
        // TDS Weak (약한 브랜드 강조)
        weak:
          "bg-[#e8f3ff] hover:bg-[#d5e7ff] text-[#3182f6]",
        // TDS Ghost
        ghost:
          "text-[#4e5968] hover:text-[#191f28] hover:bg-[#f2f4f6]",
        // TDS Danger (파괴적 액션)
        danger:
          "bg-[#f04452] hover:bg-[#d63845] active:bg-[#bd2b37] text-white",
        // TDS Outline
        outline:
          "border border-[#e5e8eb] bg-white hover:bg-[#f9fafb] text-[#191f28]",
        // Default mapping
        default:
          "bg-[#3182f6] hover:bg-[#256cd8] active:bg-[#1b56b3] text-white shadow-sm",
        link: "text-[#3182f6] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        // XL: 56px, radius 16px
        xl: "h-14 px-6 text-[17px] font-bold rounded-2xl gap-2",
        // L: 48px, radius 14px
        lg: "h-12 px-5 text-[16px] font-bold rounded-xl gap-2",
        // M / default: 40px, radius 12px
        default: "h-10 px-4 text-[14px] font-semibold rounded-xl gap-1.5",
        // S: 32px, radius 10px
        sm: "h-8 px-3 text-[13px] font-medium rounded-lg gap-1.5",
        // XS: 28px, radius 8px
        xs: "h-7 px-2.5 text-[12px] font-medium rounded-lg gap-1",
        // Icon buttons
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-xs": "size-7 rounded-md",
        // Full Pill CTA (56px)
        pill: "h-14 px-6 text-[17px] font-bold rounded-full gap-2",
        "pill-sm": "h-9 px-4 text-[13px] font-semibold rounded-full gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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
  );
}

export { Button, buttonVariants };
