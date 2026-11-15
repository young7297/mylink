import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-medium select-none font-sans transition-colors rounded-[6px]",
  {
    variants: {
      variant: {
        // TDS Blue Weak (기본)
        default: "bg-[#e8f3ff] text-[#3182f6]",
        // TDS Grey Weak (중립 태그)
        grey: "bg-[#f2f4f6] text-[#4e5968]",
        // TDS Green (성공, 활성)
        green: "bg-[#e6f9f0] text-[#00a854]",
        // TDS Red (주의, 비활성)
        red: "bg-[#feecee] text-[#f04452]",
        // TDS Yellow/Orange (알림, 중요)
        yellow: "bg-[#fff4e5] text-[#d9730d]",
        // TDS Dark (강한 강조)
        dark: "bg-[#191f28] text-white",
        // TDS Outline
        outline: "border border-[#e5e8eb] text-[#6b7684] bg-white",
      },
      size: {
        default: "text-[12px] px-2 py-0.5 min-h-[22px]",
        xs: "text-[11px] px-1.5 py-0.2 min-h-[20px]",
        sm: "text-[12px] px-2 py-0.5 min-h-[22px]",
        md: "text-[13px] px-2.5 py-1 min-h-[26px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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
  );
}

export { Badge, badgeVariants };
