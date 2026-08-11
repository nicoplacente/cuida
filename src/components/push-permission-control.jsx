"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getServiceWorkerRegistration,
  haveSameApplicationServerKey,
  urlBase64ToUint8Array,
} from "@/utils/push-subscriptions";

async function saveSubscription(subscription) {
  try {
    const response = await fetch("/api/push/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function removeSubscription(subscription) {
  const response = await fetch("/api/push/subscriptions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la suscripción.");
  }

  const unsubscribed = await subscription.unsubscribe();
  if (!unsubscribed) {
    throw new Error("No se pudo desactivar la suscripción.");
  }
}

export function PushPermissionControl({ publicKey }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    let isMounted = true;

    getServiceWorkerRegistration()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!isMounted) return;

        const hasCurrentSubscription =
          subscription &&
          (!publicKey ||
            haveSameApplicationServerKey(
              subscription,
              urlBase64ToUint8Array(publicKey),
            ));
        setStatus(hasCurrentSubscription ? "enabled" : "idle");
      })
      .catch(() => {
        if (isMounted) setStatus("idle");
      });

    return () => {
      isMounted = false;
    };
  }, [publicKey]);

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

      const registration = await getServiceWorkerRegistration();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      let subscription = await registration.pushManager.getSubscription();

      if (
        subscription &&
        !haveSameApplicationServerKey(subscription, applicationServerKey)
      ) {
        await removeSubscription(subscription);
        subscription = null;
      }

      subscription =
        subscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        }));

      const saved = await saveSubscription(subscription);
      if (!saved) {
        setStatus("idle");
        toast.error(
          "El permiso está habilitado, pero no pudimos guardar los avisos. Intentá nuevamente.",
        );
        return;
      }

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
      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription(subscription);
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
    <div className="grid gap-2">
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
      {status === "enabled" ? (
        <p className="text-xs text-[color:var(--care-muted)]">
          Los avisos solicitarán sonido y vibración. El volumen y el modo
          Concentración dependen de tu dispositivo.
        </p>
      ) : null}
    </div>
  );
}
