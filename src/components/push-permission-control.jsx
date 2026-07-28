"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = window.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

export function PushPermissionControl({ publicKey }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? "enabled" : "idle"))
      .catch(() => setStatus("unsupported"));
  }, []);

  async function enable() {
    if (!publicKey) {
      toast.error("Las notificaciones todavía no están disponibles.");
      return;
    }

    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      const response = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) throw new Error("No se pudo guardar la suscripción.");
      setStatus("enabled");
      toast.success("Avisos activados en este dispositivo.");
    } catch {
      setStatus("idle");
      toast.error("No pudimos activar los avisos en este dispositivo.");
    }
  }

  async function disable() {
    setStatus("loading");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("idle");
      toast.success("Avisos desactivados en este dispositivo.");
    } catch {
      setStatus("enabled");
      toast.error("No pudimos desactivar los avisos en este dispositivo.");
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-[color:var(--care-muted)]">
        Este navegador no admite notificaciones Push. En iPhone, instala Cuida en la
        pantalla de inicio y abrila desde allí.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-[color:var(--care-warning)]">
        Los avisos están bloqueados. Podés habilitarlos desde la configuración del navegador.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={status === "loading"}
        onClick={status === "enabled" ? disable : enable}
        className="min-h-10 rounded-full border border-[color:var(--care-cloud)] bg-white px-4 text-sm font-semibold transition hover:border-[color:var(--care-teal)] disabled:opacity-60"
      >
        {status === "loading"
          ? "Procesando…"
          : status === "enabled"
            ? "Desactivar avisos en este dispositivo"
            : "Activar avisos en este dispositivo"}
      </button>
    </div>
  );
}
