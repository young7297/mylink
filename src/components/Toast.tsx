"use client";

import React from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  isVisible: boolean;
  onClose?: () => void;
}

export default function Toast({
  message,
  type = "info",
  isVisible,
  onClose,
}: ToastProps) {
  if (!isVisible) return null;

  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all transform duration-300 ${typeStyles[type]}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 font-bold text-white hover:opacity-75 focus:outline-none"
        >
          ✕
        </button>
      )}
    </div>
  );
}
