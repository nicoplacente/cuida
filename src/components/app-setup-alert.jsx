"use client";

import { useEffect, useRef } from "react";
import { usePwaInstallation } from "@/components/pwa-registration";
import {
  getInstallGuide,
  getSetupAlertMessage,
  markSetupAlertShown,
  wasSetupAlertShown,
} from "@/utils/pwa-installation";
import { hasActivePushSubscription } from "@/utils/push-subscriptions";

export function AppSetupAlert({ publicKey }) {
  const { isInstalled, isReady } = usePwaInstallation();
  const hasAlertedRef = useRef(false);

  useEffect(() => {
    if (
      !isReady ||
      isInstalled ||
      hasAlertedRef.current ||
      wasSetupAlertShown(window.sessionStorage)
    ) {
      return undefined;
    }

    let isCancelled = false;

    async function showSetupAlert() {
      const hasActiveSubscription = await hasActivePushSubscription(publicKey);
      if (isCancelled || hasActiveSubscription || hasAlertedRef.current) return;

      hasAlertedRef.current = true;
      window.alert(getSetupAlertMessage(getInstallGuide(window.navigator)));
      markSetupAlertShown(window.sessionStorage);
    }

    showSetupAlert();

    return () => {
      isCancelled = true;
    };
  }, [isInstalled, isReady, publicKey]);

  return null;
}
