"use client";

import React from "react";

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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ maxWidth: "90vw", width: "420px" }}
    >
      <div className="bg-[#7a8aba] bevel-plate shadow-xl p-1 text-[#21242e]">
        {/* Carbon Top bar */}
        <div className="carbon-halftone px-2 py-1 flex items-center justify-between text-white border-b border-[#3d4f97]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f68d1f] inline-block animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.5px] uppercase text-[#e48600]">
              SYSTEM MESSAGE
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-4 h-4 bg-[#21242e] border border-[#3d4f97] text-white flex items-center justify-center font-bold text-[9px] hover:bg-[#e60012] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Message Body Inset */}
        <div className="bg-[#dedede] inset-plate-subtle p-2.5 flex items-center gap-2.5 mt-1">
          <div className="w-5 h-5 rounded-full bg-[#f68d1f] text-white flex items-center justify-center font-bold text-[10px] shrink-0 bevel-button">
            ▶
          </div>
          <span className="text-xs font-bold text-[#21242e] leading-snug">
            {message}
          </span>
        </div>
      </div>
    </aside>
  );
}
