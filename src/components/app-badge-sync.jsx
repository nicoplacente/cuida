"use client";

import { useEffect } from "react";
import { syncAppBadge } from "@/utils/app-badge";

export function AppBadgeSync({ unreadCount }) {
  useEffect(() => {
    syncAppBadge(window.navigator, unreadCount);
  }, [unreadCount]);

  return null;
}
