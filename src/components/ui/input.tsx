import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full font-sans text-[#191f28] transition-all outline-none disabled:pointer-events-none disabled:opacity-40 placeholder:text-[#8b95a1]",
  {
    variants: {
      variant: {
        // TDS 표준 인풋: 회색 배경 -> 포커스 시 흰색 + 1.5px Toss Blue 테두리
        default:
          "bg-[#f2f4f6] border border-transparent focus:bg-white focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/15",
        // 흰색 바탕 인풋
        white:
          "bg-white border border-[#e5e8eb] focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/15",
      },
      sizeVariant: {
        // TDS 표준 48px 높이
        default: "h-12 px-4 text-[15px] rounded-xl",
        sm: "h-10 px-3 text-[14px] rounded-lg",
        lg: "h-14 px-5 text-[16px] rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      sizeVariant: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

function Input({
  className,
  variant,
  sizeVariant,
  type = "text",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, sizeVariant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
