"use client";

import React from "react";
import { CheckCircle2 } from "@/components/icons";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose?: () => void;
}

export default function Toast({
  message,
  isVisible,
  onClose,
}: ToastProps) {
  if (!isVisible) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
      style={{ maxWidth: "90vw", width: "360px" }}
    >
      <div className="bg-[#191f28] text-white rounded-2xl px-4 py-3.5 shadow-toss-toast flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="w-5 h-5 text-[#00b569] shrink-0" />
          <span className="text-[14px] font-medium leading-snug truncate">
            {message}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-white/60 hover:text-white text-xs shrink-0 cursor-pointer p-1"
          >
            ✕
          </button>
        )}
      </div>
    </aside>
  );
}
