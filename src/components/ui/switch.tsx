"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
  id?: string
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
    if (disabled) return
    onCheckedChange(!checked)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onCheckedChange(!checked)
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center p-0.5 transition-colors font-sans inset-plate-subtle",
          checked ? "bg-[#21242e]" : "bg-[#7a8aba]",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* 하드웨어 락커 스위치 썸 (Thumb) 비즈 */}
        <span
          className={cn(
            "pointer-events-none block h-3.5 w-3.5 bevel-button shadow-sm transition-transform duration-150 ease-in-out",
            checked
              ? "translate-x-4 bg-[#f68d1f]"
              : "translate-x-0 bg-[#dedede]"
          )}
        />
      </button>

      {label && (
        <span
          onClick={handleClick}
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider text-[#21242e] cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export { Switch }
