"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { LinkButton } from "@/components/ui";

export function MobileLandingNavigation({ showDonations = false }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
        className="flex size-10 items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)]"
        onClick={() => setIsOpen((open) => !open)}
        title={isOpen ? "Cerrar menú" : "Abrir menú"}
        type="button"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen ? (
        <nav
          aria-label="Navegación principal móvil"
          className="absolute inset-x-0 top-full z-30 grid h-[calc(100dvh-5rem)] content-start gap-2 overflow-y-auto border-t border-[color:var(--care-cloud)] bg-white p-4 shadow-[0_22px_70px_rgba(11,31,58,0.16)] sm:px-6"
        >
          <a
            href="#solucion"
            onClick={closeMenu}
            className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]"
          >
            Solución
          </a>
          <a
            href="#caracteristicas"
            onClick={closeMenu}
            className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]"
          >
            Características
          </a>
          {showDonations ? (
            <a
              href="#donaciones"
              onClick={closeMenu}
              className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]"
            >
              Donar
            </a>
          ) : null}
          <a
            href="/login"
            onClick={closeMenu}
            className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]"
          >
            Ingresar
          </a>
          <LinkButton href="/registro" className="mt-2 w-full">
            Comenzar gratis
          </LinkButton>
        </nav>
      ) : null}
    </div>
  );
}
