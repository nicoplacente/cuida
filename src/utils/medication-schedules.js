const APP_TIME_ZONE_OFFSET = process.env.APP_TIME_ZONE_OFFSET || "-03:00";
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "America/Argentina/Buenos_Aires";
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export const MEDICATION_SCHEDULE_TYPES = Object.freeze({
  DAILY_TIMES: "DAILY_TIMES",
  INTERVAL: "INTERVAL",
});

function getStoredDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function getLocalDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function getLocalInstant(dateKey, time) {
  return new Date(`${dateKey}T${time}:00${APP_TIME_ZONE_OFFSET}`);
}

function getRangeDateKeys(rangeStart, rangeEnd) {
  const keys = [];
  let dateKey = getLocalDateKey(rangeStart);
  const endKey = getLocalDateKey(rangeEnd);

  while (dateKey <= endKey) {
    keys.push(dateKey);
    dateKey = addDays(dateKey, 1);
  }

  return keys;
}

function isWithinTreatment(dateKey, startDateKey, endDateKey) {
  return dateKey >= startDateKey && (!endDateKey || dateKey <= endDateKey);
}

function buildOccurrence(scheduledFor) {
  const date = new Date(scheduledFor);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    scheduledFor: date,
    dateKey: `${values.year}-${values.month}-${values.day}`,
    time: new Intl.DateTimeFormat("en-GB", {
      timeZone: APP_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
}

export function getMedicationOccurrences(medication, rangeStart, rangeEnd) {
  const startDateKey = getStoredDateKey(medication.startDate);
  const endDateKey = medication.endDate ? getStoredDateKey(medication.endDate) : null;
  const lowerBound = new Date(rangeStart).getTime();
  const upperBound = new Date(rangeEnd).getTime();

  if (medication.scheduleType === MEDICATION_SCHEDULE_TYPES.INTERVAL) {
    const intervalHours = Number(medication.intervalHours);
    if (!Number.isInteger(intervalHours) || intervalHours <= 0) return [];

    const anchor = getLocalInstant(startDateKey, medication.schedule).getTime();
    const intervalMs = intervalHours * HOUR_MS;
    const firstIndex = Math.max(0, Math.ceil((lowerBound - anchor) / intervalMs));
    const endLimit = endDateKey
      ? getLocalInstant(addDays(endDateKey, 1), "00:00").getTime() - 1
      : Number.POSITIVE_INFINITY;
    const occurrences = [];

    for (
      let timestamp = anchor + firstIndex * intervalMs;
      timestamp <= upperBound && timestamp <= endLimit;
      timestamp += intervalMs
    ) {
      occurrences.push(buildOccurrence(timestamp));
    }

    return occurrences;
  }

  const times = (medication.times || [])
    .map(({ time }) => time)
    .filter(Boolean)
    .toSorted();
  const occurrences = [];

  for (const dateKey of getRangeDateKeys(rangeStart, rangeEnd)) {
    if (!isWithinTreatment(dateKey, startDateKey, endDateKey)) continue;

    for (const time of times) {
      const scheduledFor = getLocalInstant(dateKey, time);
      if (scheduledFor.getTime() < lowerBound || scheduledFor.getTime() > upperBound) {
        continue;
      }
      occurrences.push({ scheduledFor, dateKey, time });
    }
  }

  return occurrences;
}

export function getMedicationFrequencyLabel(medication) {
  if (medication.scheduleType === MEDICATION_SCHEDULE_TYPES.INTERVAL) {
    return `Cada ${medication.intervalHours} horas`;
  }

  const count = medication.dailyDoseCount || medication.times?.length || 1;
  return count === 1 ? "1 vez por día" : `${count} veces por día`;
}

export function getTreatmentEndInstant(endDate) {
  if (!endDate) return null;
  const endDateKey = getStoredDateKey(endDate);
  return new Date(getLocalInstant(addDays(endDateKey, 1), "00:00").getTime() - 1);
}

export { DAY_MS, HOUR_MS };
