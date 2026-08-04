"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon";
import { usePwaInstallation } from "@/components/pwa-registration";

function getInstallGuide() {
  const userAgent = window.navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  if (isIos) {
    return {
      intro: "Abrí Cuida en Safari y seguí estos pasos:",
      steps: [
        "Tocá el botón Compartir de Safari.",
        "Elegí “Agregar a inicio”.",
        "Activá “Abrir como aplicación”, si aparece, y confirmá con “Agregar”.",
      ],
      title: "Instalar Cuida en iPhone o iPad",
    };
  }

  if (/Android/i.test(userAgent)) {
    return {
      intro: "Desde el menú de tu navegador:",
      steps: [
        "Abrí el menú de opciones del navegador.",
        "Elegí “Instalar aplicación” o “Agregar a pantalla principal”.",
        "Activá “Abrir como aplicación”, si aparece, y confirmá la instalación.",
      ],
      title: "Instalar Cuida en Android",
    };
  }

  return {
    intro: "Desde este navegador:",
    steps: [
      "Buscá el icono de instalación en la barra de direcciones o abrí el menú del navegador.",
      "Elegí “Instalar Cuida” o “Instalar aplicación”.",
      "Confirmá la instalación para abrir Cuida como una aplicación independiente.",
    ],
    title: "Instalar Cuida en este dispositivo",
  };
}

export function InstallAppButton({ className = "" }) {
  const { isInstalled, isReady, promptInstall } = usePwaInstallation();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const titleId = useId();
  const buttonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return undefined;

    if (isGuideOpen && !dialog.open) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();

      return () => {
        document.body.style.overflow = previousOverflow;
        if (dialog.open) dialog.close();
      };
    }

    return undefined;
  }, [isGuideOpen]);

  if (isInstalled) return null;

  const guide = isReady ? getInstallGuide() : null;

  function closeGuide() {
    setIsGuideOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  }

  async function handleInstall() {
    const nativePromptOpened = await promptInstall();

    if (!nativePromptOpened) setIsGuideOpen(true);
  }

  return (
    <>
      <button
        aria-hidden={!isReady}
        className={`inline-flex min-h-10 items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-0 ${className}`}
        disabled={!isReady}
        onClick={handleInstall}
        ref={buttonRef}
        type="button"
      >
        Instalar Cuida
      </button>

      <dialog
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-[color:var(--care-cloud)] bg-white p-0 text-[color:var(--care-ink)] shadow-[0_28px_90px_rgba(11,31,58,0.24)] backdrop:bg-[rgba(11,31,58,0.48)]"
        onCancel={(event) => {
          event.preventDefault();
          closeGuide();
        }}
        onClose={() => setIsGuideOpen(false)}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeGuide();
        }}
        ref={dialogRef}
      >
        {guide ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
                  Aplicación web
                </p>
                <h2
                  className="mt-2 text-2xl font-semibold tracking-[-0.02em]"
                  id={titleId}
                >
                  {guide.title}
                </h2>
              </div>
              <button
                aria-label="Cerrar instrucciones de instalación"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--care-cloud)] text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={closeGuide}
                title="Cerrar"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <p className="mt-6 text-[color:var(--care-ink-soft)]">{guide.intro}</p>
            <ol className="mt-4 grid list-decimal gap-3 pl-6 text-[color:var(--care-ink-soft)]">
              {guide.steps.map((step) => (
                <li key={step} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--care-teal)] px-6 py-3 text-base font-semibold text-[color:var(--care-ink)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={closeGuide}
              type="button"
            >
              Entendido
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
