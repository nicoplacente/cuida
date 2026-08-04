"use client";

import { useEffect, useId, useRef } from "react";
import { PrimaryButton } from "@/components/ui";

export function GameCompletionModal({
  description,
  onPrimaryAction,
  onRestart,
  primaryLabel,
  title,
}) {
  const descriptionId = useId();
  const titleId = useId();
  const dialogRef = useRef(null);
  const primaryButtonRef = useRef(null);

  useEffect(() => {
    primaryButtonRef.current?.focus();
  }, []);

  function handleKeyDown(event) {
    if (event.key !== "Tab") {
      return;
    }

    const buttons = Array.from(dialogRef.current?.querySelectorAll("button") || []);
    if (!buttons.length) {
      return;
    }

    const firstButton = buttons[0];
    const lastButton = buttons.at(-1);

    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton.focus();
    }
  }

  return (
    <div className="absolute inset-0 z-20 bg-[rgba(248,251,253,0.88)] p-4 backdrop-blur-[2px] sm:p-6">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="sticky top-4 mx-auto w-full max-w-md rounded-3xl border border-[color:var(--care-cloud)] bg-white p-6 text-center shadow-[0_28px_90px_rgba(11,31,58,0.22)] sm:top-6 sm:p-8"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
          Nivel superado
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]" id={titleId}>
          {title}
        </h2>
        <p className="mt-3 text-sm text-[color:var(--care-ink-soft)]" id={descriptionId}>
          {description}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            className="min-h-12 rounded-full border border-[color:var(--care-cloud)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={onRestart}
            type="button"
          >
            Reiniciar nivel
          </button>
          <PrimaryButton
            className="px-5 text-sm"
            onClick={onPrimaryAction}
            ref={primaryButtonRef}
            type="button"
          >
            {primaryLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
