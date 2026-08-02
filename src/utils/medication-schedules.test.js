import assert from "node:assert/strict";
import test from "node:test";
import { getMedicationOccurrences } from "./medication-schedules.js";

test("genera varios horarios diarios dentro del tratamiento", () => {
  const occurrences = getMedicationOccurrences(
    {
      scheduleType: "DAILY_TIMES",
      startDate: new Date("2026-08-01T12:00:00Z"),
      endDate: new Date("2026-08-02T12:00:00Z"),
      times: [{ time: "08:00" }, { time: "20:00" }],
    },
    new Date("2026-08-01T03:00:00Z"),
    new Date("2026-08-03T02:59:59.999Z"),
  );

  assert.deepEqual(
    occurrences.map(({ dateKey, time }) => `${dateKey} ${time}`),
    ["2026-08-01 08:00", "2026-08-01 20:00", "2026-08-02 08:00", "2026-08-02 20:00"],
  );
});

test("calcula intervalos continuos que cruzan la madrugada", () => {
  const occurrences = getMedicationOccurrences(
    {
      scheduleType: "INTERVAL",
      startDate: new Date("2026-08-01T12:00:00Z"),
      endDate: null,
      intervalHours: 6,
      schedule: "20:00",
    },
    new Date("2026-08-01T03:00:00Z"),
    new Date("2026-08-02T14:00:00Z"),
  );

  assert.deepEqual(
    occurrences.map(({ dateKey, time }) => `${dateKey} ${time}`),
    ["2026-08-01 20:00", "2026-08-02 02:00", "2026-08-02 08:00"],
  );
});

test("respeta la fecha final inclusiva en intervalos", () => {
  const occurrences = getMedicationOccurrences(
    {
      scheduleType: "INTERVAL",
      startDate: new Date("2026-08-01T12:00:00Z"),
      endDate: new Date("2026-08-01T12:00:00Z"),
      intervalHours: 8,
      schedule: "08:00",
    },
    new Date("2026-08-01T03:00:00Z"),
    new Date("2026-08-03T02:59:59.999Z"),
  );

  assert.deepEqual(
    occurrences.map(({ dateKey, time }) => `${dateKey} ${time}`),
    ["2026-08-01 08:00", "2026-08-01 16:00"],
  );
});
