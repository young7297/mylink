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
      bg: "bg-emerald-600/90 dark:bg-emerald-500/90",
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: "bg-rose-600/90 dark:bg-rose-500/90",
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    info: {
      bg: "bg-indigo-600/90 dark:bg-indigo-500/90",
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const { bg, icon } = typeConfig[type] || typeConfig.info;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl shadow-black/10 backdrop-blur-md text-white text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
      style={{ minWidth: "260px", maxWidth: "90vw" }}
    >
      <div className={`absolute inset-0 rounded-2xl ${bg} -z-10`} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/25 -z-10" />
      {icon}
      <span className="flex-1 text-center sm:text-left">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="닫기"
          className="ml-1 p-1 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </aside>
  );
}
