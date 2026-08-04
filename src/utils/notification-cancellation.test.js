import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

function getActionSource(source, actionName, nextActionName) {
  const start = source.indexOf(`export async function ${actionName}`);
  const end = source.indexOf(`export async function ${nextActionName}`, start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

test("administrar una toma cancela atómicamente su aviso pendiente", () => {
  const source = readSource("../features/medications/actions.js");
  const action = getActionSource(
    source,
    "administerMedicationAction",
    "toggleMedicationAction",
  );

  assert.match(action, /prisma\.\$transaction/);
  assert.match(action, /notification\.deleteMany/);
  assert.match(action, /occurrenceFor: scheduledFor/);
  assert.match(action, /sentAt: null/);
});

test("completar una tarea cancela atómicamente sus avisos pendientes", () => {
  const source = readSource("../features/tasks/actions.js");
  const action = getActionSource(source, "completeTaskAction", "deleteTaskAction");

  assert.match(action, /prisma\.\$transaction/);
  assert.match(action, /transaction\.notification\.deleteMany/);
  assert.match(action, /sentAt: null/);
});

test("completar un evento cancela atómicamente sus avisos pendientes", () => {
  const source = readSource("../features/calendar/actions.js");
  const action = getActionSource(source, "completeEventAction", "deleteEventAction");

  assert.match(action, /prisma\.\$transaction/);
  assert.match(action, /notification\.deleteMany/);
  assert.match(action, /sentAt: null/);
});
