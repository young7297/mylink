"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors={false}
      closeButton
      offset="24px"
      toastOptions={{
        className: "font-sans",
        style: {
          fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
        },
        classNames: {
          toast:
            "group toast bg-[#191f28] text-white border border-[#333d4b] shadow-2xl rounded-2xl px-4 py-3.5 text-[14.5px] font-semibold leading-snug tracking-tight flex items-center gap-3 min-w-[320px] max-w-[92vw] sm:max-w-[420px]",
          title: "text-[14.5px] font-semibold text-white tracking-tight leading-snug",
          description: "text-[13px] font-normal text-[#b0b8c1] leading-normal",
          actionButton:
            "bg-[#3182f6] text-white font-bold text-[13px] px-3.5 py-1.5 rounded-xl hover:bg-[#256cd8] transition-colors shadow-sm",
          cancelButton:
            "bg-[#333d4b] text-[#e5e8eb] font-medium text-[13px] px-3.5 py-1.5 rounded-xl hover:bg-[#4e5968] transition-colors",
          closeButton:
            "bg-[#2b3440] text-white/80 hover:text-white hover:bg-[#3d4756] border-0 transition-colors shadow-sm",
          success: "!bg-[#191f28] !text-white !border-[#333d4b]",
          error: "!bg-[#2a1215] !text-[#ff858d] !border-[#f04452]/40",
          info: "!bg-[#191f28] !text-white !border-[#3182f6]/40",
        },
      }}
    />
  );
}

export { toast } from "sonner";
