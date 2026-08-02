"use client";

import { useEffect } from "react";

const refreshInterval = 14 * 60 * 1000;
let activeRefresh = null;

function requestSessionRefresh() {
  if (!activeRefresh) {
    activeRefresh = fetch("/api/auth/session/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    }).finally(() => {
      activeRefresh = null;
    });
  }

  return activeRefresh;
}

export function SessionKeeper() {
  useEffect(() => {
    let timeoutId;
    let isDisposed = false;

    const scheduleRefresh = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(refresh, refreshInterval);
    };

    const refresh = async () => {
      if (isDisposed || document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await requestSessionRefresh();
        if (response.status === 401) {
          window.location.assign("/login?reason=session-expired");
          return;
        }
      } catch {
        // Los errores transitorios no deben cerrar una sesión todavía válida.
      }

      if (!isDisposed) {
        scheduleRefresh();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    refresh();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isDisposed = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
