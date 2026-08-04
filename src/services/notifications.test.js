import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNotification,
  getCareContextsByCircle,
  getNotificationDateKey,
  getScheduledInstant,
  validateNotificationEnvironment,
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
    patientName: "María",
    userId: "user-1",
    dateKey: "2026-07-28",
    occurrenceLabel: "16:00",
    occurrenceTime: getScheduledInstant("2026-07-28", "16:00"),
    reminderMinutes: 30,
  });

  assert.equal(notification.title, "Consulta neurológica");
  assert.equal(
    notification.message,
    "Para María: este evento comienza a las 16:00.",
  );
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
    patientName: "María",
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

test("genera títulos y descripciones para los seis tipos de aviso", () => {
  const cases = [
    {
      type: "MEDICATION",
      kind: "REMINDER",
      source: {
        id: "medication-1",
        careCircleId: "circle-1",
        name: "Autogena",
        dose: "100 mg",
      },
      time: "23:50",
      title: "Momento de la medicación en Cuida",
      message: "Para María: Autogena 100 mg está programado para las 23:50.",
    },
    {
      type: "MEDICATION",
      kind: "MISSED",
      source: {
        id: "medication-1",
        careCircleId: "circle-1",
        name: "Autogena",
        dose: "100 mg",
      },
      time: "23:50",
      title: "Medicamento sin administrar en Cuida",
      message:
        "Para María: Autogena 100 mg debía administrarse a las 23:50 y continúa pendiente una hora después.",
    },
    {
      type: "TASK",
      kind: "REMINDER",
      source: {
        id: "task-1",
        careCircleId: "circle-1",
        title: "Preparar la cena",
        scheduledTime: "20:00",
      },
      time: "20:00",
      title: "Preparar la cena",
      message: "Para María: esta tarea está programada para las 20:00.",
    },
    {
      type: "TASK",
      kind: "MISSED",
      source: {
        id: "task-1",
        careCircleId: "circle-1",
        title: "Preparar la cena",
        scheduledTime: "20:00",
      },
      time: "20:00",
      title: "Preparar la cena",
      message:
        "Para María: esta tarea debía realizarse a las 20:00 y continúa pendiente una hora después.",
    },
    {
      type: "EVENT",
      kind: "REMINDER",
      source: {
        id: "event-1",
        careCircleId: "circle-1",
        title: "Consulta neurológica",
        time: "16:00",
      },
      time: "16:00",
      title: "Consulta neurológica",
      message: "Para María: este evento comienza a las 16:00.",
    },
    {
      type: "EVENT",
      kind: "MISSED",
      source: {
        id: "event-1",
        careCircleId: "circle-1",
        title: "Consulta neurológica",
        time: "16:00",
      },
      time: "16:00",
      title: "Consulta neurológica",
      message:
        "Para María: este evento debía realizarse a las 16:00 y continúa pendiente una hora después.",
    },
  ];

  for (const item of cases) {
    const occurrenceTime = getScheduledInstant("2026-07-28", item.time);
    const notification = buildNotification({
      type: item.type,
      kind: item.kind,
      source: item.source,
      patientName: "María",
      userId: "user-1",
      dateKey: "2026-07-28",
      occurrenceLabel: item.time,
      occurrenceTime,
      reminderMinutes: 30,
    });

    assert.equal(notification.title, item.title);
    assert.equal(notification.message, item.message);
    assert.equal(
      notification.scheduledFor.getTime(),
      occurrenceTime.getTime() + (item.kind === "MISSED" ? 60 : -30) * 60 * 1000,
    );
  }
});

test("asocia destinatarios y paciente por círculo con un respaldo legible", () => {
  const contexts = getCareContextsByCircle([
    {
      careCircleId: "circle-1",
      userId: "user-1",
      careCircle: { name: "Familia Pérez", patient: { name: "María" } },
    },
    {
      careCircleId: "circle-1",
      userId: "user-2",
      careCircle: { name: "Familia Pérez", patient: { name: "María" } },
    },
    {
      careCircleId: "circle-2",
      userId: "user-1",
      careCircle: { name: "Círculo de apoyo", patient: null },
    },
  ]);

  assert.deepEqual(contexts.get("circle-1"), {
    patientName: "María",
    recipientIds: ["user-1", "user-2"],
  });
  assert.deepEqual(contexts.get("circle-2"), {
    patientName: "Círculo de apoyo",
    recipientIds: ["user-1"],
  });
});

test("no enumera variables faltantes en errores de configuración", () => {
  const requiredVariables = [
    "DATABASE_URL",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
  ];
  const originalValues = new Map(
    requiredVariables.map((name) => [name, process.env[name]]),
  );

  for (const name of requiredVariables) delete process.env[name];

  try {
    assert.throws(validateNotificationEnvironment, (error) => {
      assert.equal(error.name, "SafeServerError");
      assert.equal(error.code, "NOTIFICATION_CONFIGURATION_ERROR");

      for (const name of requiredVariables) {
        assert.equal(error.message.includes(name), false);
      }

      return true;
    });
  } finally {
    for (const [name, value] of originalValues) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});
