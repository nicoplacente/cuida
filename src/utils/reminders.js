export const DEFAULT_REMINDER_MINUTES = 15;

export const REMINDER_OPTIONS = Object.freeze([
  { value: 0, label: "Sin recordatorio" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
]);

const VALID_REMINDER_MINUTES = new Set(REMINDER_OPTIONS.map(({ value }) => value));

export function parseReminderMinutes(value, fallback = DEFAULT_REMINDER_MINUTES) {
  const parsed = value === null || value === undefined || value === ""
    ? fallback
    : Number(value);

  return VALID_REMINDER_MINUTES.has(parsed) ? parsed : null;
}

export function formatReminderLabel(value) {
  return REMINDER_OPTIONS.find((option) => option.value === value)?.label
    || REMINDER_OPTIONS[0].label;
}

export function getReminderScheduledFor(occurrence, reminderMinutes) {
  if (reminderMinutes === 0) return null;

  const date = new Date(occurrence);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError("La fecha de la ocurrencia no es válida.");
  }

  return new Date(date.getTime() - reminderMinutes * 60 * 1000);
}

export function buildNotificationOccurrenceKey({
  type,
  kind = "REMINDER",
  sourceId,
  dateKey,
  time,
  reminderMinutes,
}) {
  return `${type}:${kind}:${sourceId}:${dateKey}:${time}:${reminderMinutes}`;
}
