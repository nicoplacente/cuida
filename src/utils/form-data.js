const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/;
const APP_TIME_ZONE_OFFSET = process.env.APP_TIME_ZONE_OFFSET || "-03:00";

export function getFormField(formData, name) {
  return String(formData.get(name) || "").trim();
}

export function getCheckboxField(formData, name) {
  return formData.get(name) === "on";
}

export function isValidEmail(email) {
  return email.length <= 254 && emailPattern.test(email);
}

export function isValidTimeInput(value) {
  return timePattern.test(value);
}

export function parseDateInput(value) {
  if (!datePattern.test(value)) return null;

  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function parseDateTimeInput(value) {
  if (!dateTimePattern.test(value)) return null;
  const [dateValue, timeValue] = value.split("T");
  if (!parseDateInput(dateValue) || !isValidTimeInput(timeValue)) return null;

  const date = new Date(`${value}:00${APP_TIME_ZONE_OFFSET}`);
  if (Number.isNaN(date.getTime())) return null;

  const direction = APP_TIME_ZONE_OFFSET.startsWith("-") ? -1 : 1;
  const [offsetHours, offsetMinutes] = APP_TIME_ZONE_OFFSET.slice(1).split(":").map(Number);
  const offsetMilliseconds = direction
    * (offsetHours * 60 + offsetMinutes)
    * 60
    * 1000;
  const normalizedValue = new Date(date.getTime() + offsetMilliseconds)
    .toISOString()
    .slice(0, 16);
  return normalizedValue === value ? date : null;
}
