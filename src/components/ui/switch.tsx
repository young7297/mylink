"use client";

import * as React from "react";
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
  const handleClick = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCheckedChange(!checked);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out",
          checked ? "bg-[#3182f6]" : "bg-[#d1d6db]",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>

      {label && (
        <span
          onClick={handleClick}
          className={cn(
            "text-[13px] font-medium text-[#4e5968] cursor-pointer hover:text-[#191f28] transition-colors",
            disabled && "cursor-not-allowed opacity-40"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export { Switch };
