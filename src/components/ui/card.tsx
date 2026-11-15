import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "text-[#191f28] transition-all relative font-sans",
  {
    variants: {
      variant: {
        // TDS 기본 화이트 카드 (둥근 모서리 + 1px 헤어라인)
        default:
          "bg-white rounded-3xl border border-[#e5e8eb] shadow-[0_2px_12px_rgba(25,31,40,0.03)]",
        // TDS 그림자 없는 플랫 화이트 카드
        flat: "bg-white rounded-3xl border border-[#e5e8eb]",
        // TDS 부드러운 회색 카드
        grey: "bg-[#f2f4f6] rounded-2xl",
        // TDS 블루 약조 카드
        blueWeak: "bg-[#e8f3ff] text-[#3182f6] rounded-2xl",
        // 클릭 가능한 인터랙티브 카드
        interactive:
          "bg-white rounded-2xl border border-[#e5e8eb] hover:border-[#b0b8c1] active:bg-[#f9fafb] transition-colors cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

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
  );
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1 p-4 sm:p-5 pb-2", className)}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg sm:text-xl font-bold text-[#191f28] leading-snug tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-xs sm:text-sm text-[#6b7684] leading-relaxed", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-4 sm:p-5 pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between p-4 sm:p-5 pt-0 text-xs text-[#8b95a1]",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
