"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DailyPlanRefresh({ refreshAt }) {
  const router = useRouter();

  useEffect(() => {
    const refreshTime = new Date(refreshAt).getTime();
    if (Number.isNaN(refreshTime)) return undefined;

    let hasRefreshed = false;

    function refreshPlan() {
      if (hasRefreshed) return;

      hasRefreshed = true;
      router.refresh();
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible" && Date.now() >= refreshTime) {
        refreshPlan();
      }
    }

    const timeoutId = window.setTimeout(
      refreshPlan,
      Math.max(0, refreshTime - Date.now() + 1000),
    );
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshAt, router]);

  return null;
}
