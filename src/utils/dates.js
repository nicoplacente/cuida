export function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getEndOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export function getScheduledDate(time) {
  const [hours = "0", minutes = "0"] = String(time).split(":");
  const date = getStartOfToday();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date;
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
