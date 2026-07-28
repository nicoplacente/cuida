"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      closeButton
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border-[color:var(--care-cloud)] !bg-white !text-[color:var(--care-ink)] !shadow-[0_18px_60px_rgba(11,31,58,0.16)]",
          description: "!text-[color:var(--care-ink-soft)]",
        },
      }}
    />
  );
}
