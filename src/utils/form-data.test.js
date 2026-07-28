import assert from "node:assert/strict";
import test from "node:test";
import { isValidTimeInput, parseDateInput } from "./form-data.js";

test("valida horarios de 24 horas", () => {
  assert.equal(isValidTimeInput("00:00"), true);
  assert.equal(isValidTimeInput("23:59"), true);
  assert.equal(isValidTimeInput("24:00"), false);
  assert.equal(isValidTimeInput("8:30"), false);
});

test("valida fechas de calendario sin normalizar valores imposibles", () => {
  assert.equal(parseDateInput("2026-07-27")?.toISOString(), "2026-07-27T12:00:00.000Z");
  assert.equal(parseDateInput("2026-02-30"), null);
  assert.equal(parseDateInput("2026-13-01"), null);
  assert.equal(parseDateInput("27-07-2026"), null);
});
