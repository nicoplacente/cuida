import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNotification,
  getNotificationDateKey,
  getScheduledInstant,
} from "./notifications.js";

test("calcula el día local de Argentina cerca del cambio de fecha UTC", () => {
  assert.equal(
    getNotificationDateKey(new Date("2026-07-28T02:59:59.999Z")),
    "2026-07-27",
  );
  assert.equal(
    getNotificationDateKey(new Date("2026-07-28T03:00:00.000Z")),
    "2026-07-28",
  );
});

test("convierte el horario local del recordatorio al instante correcto", () => {
  assert.equal(
    getScheduledInstant("2026-07-28", "00:15").toISOString(),
    "2026-07-28T03:15:00.000Z",
  );
});

test("mantiene separadas la hora del evento y la hora del aviso", () => {
  const notification = buildNotification({
    type: "EVENT",
    source: {
      id: "event-1",
      careCircleId: "circle-1",
      title: "Consulta neurológica",
      time: "16:00",
    },
    userId: "user-1",
    dateKey: "2026-07-28",
    occurrenceLabel: "16:00",
    occurrenceTime: getScheduledInstant("2026-07-28", "16:00"),
    reminderMinutes: 30,
  });

  assert.equal(notification.message, "Consulta neurológica comienza a las 16:00.");
  assert.equal(notification.scheduledFor.toISOString(), "2026-07-28T18:30:00.000Z");
  assert.equal(
    notification.occurrenceKey,
    "EVENT:REMINDER:event-1:2026-07-28:16:00:30",
  );
});

test("programa el aviso de incumplimiento una hora después", () => {
  const occurrenceTime = getScheduledInstant("2026-07-28", "16:00");
  const notification = buildNotification({
    type: "EVENT",
    kind: "MISSED",
    source: {
      id: "event-1",
      careCircleId: "circle-1",
      title: "Consulta neurológica",
      time: "16:00",
    },
    userId: "user-1",
    dateKey: "2026-07-28",
    occurrenceLabel: "16:00",
    occurrenceTime,
    reminderMinutes: 30,
  });

  assert.equal(notification.kind, "MISSED");
  assert.equal(notification.occurrenceFor, occurrenceTime);
  assert.equal(notification.scheduledFor.toISOString(), "2026-07-28T20:00:00.000Z");
  assert.equal(
    notification.occurrenceKey,
    "EVENT:MISSED:event-1:2026-07-28:16:00:60",
  );
});
