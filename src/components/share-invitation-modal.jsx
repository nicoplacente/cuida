"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { CloseIcon } from "@/components/icons/close-icon";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon";
import {
  createWhatsAppInvitationMessage,
  getWhatsAppAppShareUrl,
  getWhatsAppWebShareUrl,
  shouldUseWhatsAppAppLink,
} from "@/utils/whatsapp";

const whatsappFallbackDelay = 1_200;

export function ShareInvitationModal({ invitation, onClose }) {
  const closeButtonRef = useRef(null);
  const whatsappFallbackRef = useRef(null);
  const whatsappVisibilityHandlerRef = useRef(null);

  useEffect(() => {
    if (!invitation) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (whatsappFallbackRef.current) {
        window.clearTimeout(whatsappFallbackRef.current);
        whatsappFallbackRef.current = null;
      }
      if (whatsappVisibilityHandlerRef.current) {
        document.removeEventListener(
          "visibilitychange",
          whatsappVisibilityHandlerRef.current,
        );
        whatsappVisibilityHandlerRef.current = null;
      }
    };
  }, [invitation, onClose]);

  if (!invitation) {
    return null;
  }

  const message = createWhatsAppInvitationMessage(invitation);
  const whatsappAppUrl = getWhatsAppAppShareUrl(message);
  const whatsappWebUrl = getWhatsAppWebShareUrl(message);

  function handleWhatsAppShare() {
    const device = {
      maxTouchPoints: window.navigator.maxTouchPoints,
      platform: window.navigator.platform,
      userAgent: window.navigator.userAgent,
    };

    if (!shouldUseWhatsAppAppLink(device)) {
      window.open(whatsappWebUrl, "_blank", "noopener,noreferrer");
      return;
    }

    function cancelFallback() {
      if (!document.hidden || !whatsappFallbackRef.current) {
        return;
      }

      window.clearTimeout(whatsappFallbackRef.current);
      whatsappFallbackRef.current = null;
      document.removeEventListener("visibilitychange", cancelFallback);
      whatsappVisibilityHandlerRef.current = null;
    }

    whatsappVisibilityHandlerRef.current = cancelFallback;
    document.addEventListener("visibilitychange", cancelFallback);
    whatsappFallbackRef.current = window.setTimeout(() => {
      whatsappFallbackRef.current = null;
      document.removeEventListener("visibilitychange", cancelFallback);
      whatsappVisibilityHandlerRef.current = null;
      window.location.assign(whatsappWebUrl);
    }, whatsappFallbackDelay);
    window.location.assign(whatsappAppUrl);
  }

  return (
    <div
      aria-labelledby="share-invitation-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(11,31,58,0.48)] p-4"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-3xl border border-[color:var(--care-cloud)] bg-white p-6 shadow-[0_28px_90px_rgba(11,31,58,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
              Invitación lista
            </p>
            <h2
              id="share-invitation-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.02em]"
            >
              Compartir enlace para {invitation.roleLabel.toLocaleLowerCase("es-AR")}
            </h2>
          </div>
          <button
            aria-label="Cerrar modal"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border cursor-pointer border-[color:var(--care-cloud)] text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)]"
            onClick={onClose}
            ref={closeButtonRef}
            title="Cerrar"
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="mt-4 text-sm text-[color:var(--care-ink-soft)]">
          Podés enviarlo a varias personas. Todas ingresarán con el rol de {" "}
          {invitation.roleLabel.toLocaleLowerCase("es-AR")} y el enlace vencerá
          60 minutos después de su creación.
        </p>
        <p className="mt-5 break-all rounded-2xl bg-[color:var(--care-canvas)] p-4 font-mono text-xs text-[color:var(--care-ink)]">
          {invitation.link}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-[#f1f1f1f1] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
            onClick={handleWhatsAppShare}
            type="button"
          >
            <WhatsappIcon />
            Compartir por WhatsApp
          </button>
          <CopyButton value={invitation.link} />
        </div>
      </div>
    </div>
  );
}

export function ShareInvitationButton({ invitation }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--care-ink)] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Compartir invitación
      </button>
      {isOpen ? (
        <ShareInvitationModal
          invitation={invitation}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}
