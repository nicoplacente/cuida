"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copiar enlace" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--care-ink)] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-live="polite"
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
