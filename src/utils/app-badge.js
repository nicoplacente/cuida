function normalizeBadgeCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.floor(count);
}

export async function syncAppBadge(navigatorObject, unreadCount) {
  if (!navigatorObject) return false;

  const badgeCount = normalizeBadgeCount(unreadCount);

  try {
    if (badgeCount > 0 && typeof navigatorObject.setAppBadge === "function") {
      await navigatorObject.setAppBadge(badgeCount);
      return true;
    }

    if (badgeCount === 0 && typeof navigatorObject.clearAppBadge === "function") {
      await navigatorObject.clearAppBadge();
      return true;
    }

    if (badgeCount === 0 && typeof navigatorObject.setAppBadge === "function") {
      await navigatorObject.setAppBadge(0);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
