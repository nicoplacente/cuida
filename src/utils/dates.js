const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "America/Argentina/Buenos_Aires";
const APP_TIME_ZONE_OFFSET = process.env.APP_TIME_ZONE_OFFSET || "-03:00";

function getLocalDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getStartOfToday() {
  return new Date(`${getLocalDateKey()}T00:00:00${APP_TIME_ZONE_OFFSET}`);
}

export function getEndOfToday() {
  return new Date(`${getLocalDateKey()}T23:59:59.999${APP_TIME_ZONE_OFFSET}`);
}

export function getScheduledDate(time) {
  return new Date(`${getLocalDateKey()}T${time || "00:00"}:00${APP_TIME_ZONE_OFFSET}`);
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
