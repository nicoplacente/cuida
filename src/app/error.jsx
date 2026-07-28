"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Card, PrimaryButton } from "@/components/ui";

export default function ErrorPage({ reset }) {
  useEffect(() => {
    toast.error("Ocurrió un error inesperado. Intentá nuevamente.");
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">
          No pudimos cargar esta sección
        </h1>
        <p className="mt-3 text-[color:var(--care-ink-soft)]">
          Tus datos permanecen protegidos. Volvé a intentarlo en unos instantes.
        </p>
        <PrimaryButton className="mt-6" onClick={reset} type="button">
          Reintentar
        </PrimaryButton>
      </Card>
    </main>
  );
}
