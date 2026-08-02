const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "America/Argentina/Buenos_Aires";

function getDateKey(value) {
  if (typeof value === "string" && dateKeyPattern.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getCurrentDateKey(value) {
  if (typeof value === "string" && dateKeyPattern.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function calculateAge(birthDate, currentDate = new Date()) {
  const birthDateKey = getDateKey(birthDate);
  const currentDateKey = getCurrentDateKey(currentDate);
  if (!birthDateKey || !currentDateKey) return null;

  const [birthYear, birthMonth, birthDay] = birthDateKey.split("-").map(Number);
  const [currentYear, currentMonth, currentDay] = currentDateKey.split("-").map(Number);
  let age = currentYear - birthYear;

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function getPatientAge(patient, currentDate = new Date()) {
  return patient.birthDate
    ? calculateAge(patient.birthDate, currentDate)
    : patient.age;
}
