"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon } from "@/components/icons/check-icon";
import { CopyIcon } from "@/components/icons/copy-icon";

export function CopyButton({ value, label = "Copiar enlace" }) {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        setIsCopied(false);
        resetTimerRef.current = null;
      }, 2_000);
      toast.success("Enlace copiado.");
    } catch {
      toast.error("No pudimos copiar el enlace.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={isCopied ? "Enlace copiado" : label}
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-(--care-ink) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite">{isCopied ? "Copiado" : label}</span>
    </button>
  );
}
