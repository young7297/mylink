"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
}

function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  className,
  id,
}: SwitchProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(nextChecked) => onCheckedChange(nextChecked)}
        disabled={disabled}
        data-slot="switch"
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[#3182f6]/25",
          checked ? "bg-[#3182f6]" : "bg-[#d1d6db]",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </SwitchPrimitive.Root>

      {label && (
        <span
          onClick={() => !disabled && onCheckedChange(!checked)}
          className={cn(
            "text-xs font-medium cursor-pointer text-[#6b7684] hover:text-[#191f28] transition-colors",
            disabled && "cursor-not-allowed text-[#b0b8c1]"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export { Switch };
