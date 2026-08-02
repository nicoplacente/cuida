"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon";

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
].join(",");

export function EditModal({
  eyebrow,
  title,
  children,
  triggerLabel = "Editar",
  triggerTone = "neutral",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const closeButtonRef = useRef(null);

  function close() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(focusableSelector) || [],
      );
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className={`rounded-full border bg-white px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          triggerTone === "danger"
            ? "border-[#f3c7c2] text-[color:var(--care-danger)] hover:border-[color:var(--care-danger)]"
            : "border-[color:var(--care-cloud)] text-[color:var(--care-ink)] hover:border-[color:var(--care-teal)]"
        }`}
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[rgba(11,31,58,0.48)] p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          role="dialog"
        >
          <div
            className="my-auto w-full max-w-2xl rounded-3xl border border-[color:var(--care-cloud)] bg-white p-6 shadow-[0_28px_90px_rgba(11,31,58,0.24)] sm:p-8"
            ref={dialogRef}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
                  {eyebrow}
                </p>
                <h2
                  className="mt-2 text-2xl font-semibold tracking-[-0.02em]"
                  id={titleId}
                >
                  {title}
                </h2>
              </div>
              <button
                aria-label="Cerrar modal"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--care-cloud)] text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={close}
                ref={closeButtonRef}
                title="Cerrar"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-6">{children(close)}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
