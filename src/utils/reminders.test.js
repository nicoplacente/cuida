import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNotificationOccurrenceKey,
  formatReminderLabel,
  getReminderScheduledFor,
  parseReminderMinutes,
} from "./reminders.js";

test("acepta únicamente las anticipaciones configuradas", () => {
  assert.equal(parseReminderMinutes("0"), 0);
  assert.equal(parseReminderMinutes("15"), 15);
  assert.equal(parseReminderMinutes(30), 30);
  assert.equal(parseReminderMinutes("60"), 60);
  assert.equal(parseReminderMinutes("45"), null);
});

test("utiliza 15 minutos como valor predeterminado", () => {
  assert.equal(parseReminderMinutes(""), 15);
  assert.equal(parseReminderMinutes(undefined), 15);
});

test("no programa una notificación cuando la anticipación es cero", () => {
  assert.equal(getReminderScheduledFor(new Date("2026-07-27T23:00:00Z"), 0), null);
  assert.equal(formatReminderLabel(0), "Sin recordatorio");
});

test("resta la anticipación del horario real", () => {
  const occurrence = new Date("2026-07-27T23:00:00Z");

  assert.equal(
    getReminderScheduledFor(occurrence, 15).toISOString(),
    "2026-07-27T22:45:00.000Z",
  );
  assert.equal(
    getReminderScheduledFor(occurrence, 60).toISOString(),
    "2026-07-27T22:00:00.000Z",
  );
});

test("resuelve correctamente un recordatorio que cruza al día anterior", () => {
  const occurrence = new Date("2026-07-28T00:15:00-03:00");

  assert.equal(
    getReminderScheduledFor(occurrence, 30).toISOString(),
    "2026-07-28T02:45:00.000Z",
  );
});

test("la clave de ocurrencia cambia con el horario o la anticipación", () => {
  const base = {
    type: "EVENT",
    sourceId: "event-1",
    dateKey: "2026-07-27",
  };
  const original = buildNotificationOccurrenceKey({
    ...base,
    time: "20:00",
    reminderMinutes: 15,
  });

  assert.equal(original, "EVENT:REMINDER:event-1:2026-07-27:20:00:15");
  assert.notEqual(
    original,
    buildNotificationOccurrenceKey({
      ...base,
      time: "20:30",
      reminderMinutes: 15,
    }),
  );
  assert.notEqual(
    original,
    buildNotificationOccurrenceKey({
      ...base,
      time: "20:00",
      reminderMinutes: 30,
    }),
  );
});
