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
  type = "success",
  isVisible,
  onClose,
}: ToastProps) {
  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bg: "bg-[#4ADE80]",
      sticker: "★ SUCCESS",
    },
    error: {
      bg: "bg-[#FB7185]",
      sticker: "✕ ERROR",
    },
    info: {
      bg: "bg-[#FDE047]",
      sticker: "✦ NOTICE",
    },
  };

  const { bg, sticker } = typeConfig[type] || typeConfig.info;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ maxWidth: "92vw" }}
    >
      <div
        className={`${bg} border-[3px] border-black text-black px-5 py-3 rounded-xl shadow-[5px_5px_0px_0px_#000] flex items-center gap-3 transition-transform animate-bounce duration-300 font-sans`}
      >
        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-white shrink-0 tracking-wider">
          {sticker}
        </span>
        <span className="text-sm font-extrabold text-black tracking-tight">
          {message}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="알림 닫기"
            className="ml-2 w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-black text-xs hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </aside>
  );
}
