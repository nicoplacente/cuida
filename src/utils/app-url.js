export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://cuida.codeluxe.tech";
  }

  return "http://localhost:3000";
}
