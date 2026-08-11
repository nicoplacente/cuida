import assert from "node:assert/strict";
import test from "node:test";
import { createDailyPlan } from "./daily-plan.js";
import { getStartOfNextDay } from "./dates.js";

const dateKey = "2026-08-10";

test("reúne el plan del día y ordena primero todo el día y luego los horarios", () => {
  const dailyPlan = createDailyPlan({
    dateKey,
    medicationPlan: [
      {
        administration: null,
        medication: { id: "medication-1", name: "Donepezilo", dose: "10 mg" },
        occurrence: {
          dateKey,
          scheduledFor: new Date("2026-08-10T11:00:00Z"),
          time: "08:00",
        },
      },
    ],
    tasks: [
      {
        id: "task-all-day",
        title: "Preparar documentación",
        scheduledDate: new Date("2026-08-10T12:00:00Z"),
        scheduledTime: null,
        completed: false,
      },
      {
        id: "task-tomorrow",
        title: "Tarea de mañana",
        scheduledDate: new Date("2026-08-11T12:00:00Z"),
        scheduledTime: "07:00",
        completed: false,
      },
    ],
    events: [
      {
        id: "event-1",
        title: "Control médico",
        date: new Date("2026-08-10T12:00:00Z"),
        time: "10:30",
        completed: true,
      },
    ],
  });

  assert.deepEqual(
    dailyPlan.map(({ timeLabel, type }) => `${timeLabel}:${type}`),
    ["Todo el día:TASK", "08:00:MEDICATION", "10:30:EVENT"],
  );
  assert.equal(dailyPlan.at(-1).statusLabel, "Realizado");
});

test("calcula el inicio del día siguiente en la zona horaria de la aplicación", () => {
  assert.equal(
    getStartOfNextDay(new Date("2026-08-10T20:00:00Z")).toISOString(),
    "2026-08-11T03:00:00.000Z",
  );
});
