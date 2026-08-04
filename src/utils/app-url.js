export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://cuida.codeluxe.tech";
  }

  return "http://localhost:3000";
}

export function getAppOrigin(appUrl = getAppUrl()) {
  try {
    const url = new URL(appUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isAppOrigin(origin, appUrl = getAppUrl()) {
  if (typeof origin !== "string") return false;
  return origin === getAppOrigin(appUrl);
}

export function isRequestFromAppOrigin(request, appUrl = getAppUrl()) {
  return isAppOrigin(request.headers.get("origin"), appUrl);
}
