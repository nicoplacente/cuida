const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function getFormField(formData, name) {
  return String(formData.get(name) || "").trim();
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
