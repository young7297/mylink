"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

export interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "value" | "onValueChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, onValueChange, ...props }, ref) => (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      className={cn("w-full", className)}
      onValueChange={(val) => onValueChange?.(String(val))}
      {...props}
    />
  )
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tab> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, ...props }, ref) => (
    <TabsPrimitive.Tab
      ref={ref}
      value={value}
      data-slot="tabs-trigger"
      className={cn(
        // TDS Full Pill Chip (34px height)
        "shrink-0 h-[34px] px-3.5 flex items-center justify-center rounded-full text-[13px] transition-all cursor-pointer font-sans whitespace-nowrap outline-none select-none active:scale-[0.98]",
        // Inactive 기본 상태
        "bg-white text-[#4e5968] border border-[#e5e8eb] hover:bg-[#f2f4f6] font-medium",
        // Base UI data-active 활성 상태
        "data-[active]:bg-[#191f28] data-[active]:text-white data-[active]:font-semibold data-[active]:border-transparent data-[active]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Tab>
  )
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Panel>
>(({ className, value, ...props }, ref) => (
  <TabsPrimitive.Panel
    ref={ref}
    value={value}
    data-slot="tabs-content"
    className={cn("mt-2 outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
