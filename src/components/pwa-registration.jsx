"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const PwaInstallationContext = createContext(null);

function isRunningAsInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function PwaProvider({ children }) {
  const installPromptRef = useRef(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const displayMode = window.matchMedia("(display-mode: standalone)");

    function updateInstalledState() {
      setIsInstalled(isRunningAsInstalledApp());
      setIsReady(true);
    }

    function handleInstallPrompt(event) {
      event.preventDefault();
      installPromptRef.current = event;
    }

    function handleInstalled() {
      installPromptRef.current = null;
      setIsInstalled(true);
    }

    updateInstalledState();
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", updateInstalledState);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener("change", updateInstalledState);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const installPrompt = installPromptRef.current;

    if (!installPrompt) return false;

    installPromptRef.current = null;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({ isInstalled, isReady, promptInstall }),
    [isInstalled, isReady, promptInstall],
  );

  return (
    <PwaInstallationContext.Provider value={value}>
      {children}
    </PwaInstallationContext.Provider>
  );
}

export function usePwaInstallation() {
  const context = useContext(PwaInstallationContext);

  if (!context) {
    throw new Error("usePwaInstallation debe usarse dentro de PwaProvider.");
  }

  return context;
}
