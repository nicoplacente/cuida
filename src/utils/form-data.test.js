import assert from "node:assert/strict";
import test from "node:test";
import {
  getCheckboxField,
  isValidTimeInput,
  parseDateInput,
  parseDateTimeInput,
} from "./form-data.js";

test("interpreta checkboxes solo cuando reciben el valor esperado", () => {
  const checkedFormData = new FormData();
  checkedFormData.set("rememberSession", "on");
  const manipulatedFormData = new FormData();
  manipulatedFormData.set("rememberSession", "true");

  assert.equal(getCheckboxField(checkedFormData, "rememberSession"), true);
  assert.equal(getCheckboxField(new FormData(), "rememberSession"), false);
  assert.equal(getCheckboxField(manipulatedFormData, "rememberSession"), false);
});

test("valida horarios de 24 horas", () => {
  assert.equal(isValidTimeInput("00:00"), true);
  assert.equal(isValidTimeInput("23:59"), true);
  assert.equal(isValidTimeInput("24:00"), false);
  assert.equal(isValidTimeInput("8:30"), false);
});

test("valida fechas y horas locales sin normalizar valores imposibles", () => {
  assert.equal(
    parseDateTimeInput("2026-08-01T14:30")?.toISOString(),
    "2026-08-01T17:30:00.000Z",
  );
  assert.equal(parseDateTimeInput("2026-02-30T14:30"), null);
  assert.equal(parseDateTimeInput("2026-08-01T25:00"), null);
});

test("valida fechas de calendario sin normalizar valores imposibles", () => {
  assert.equal(parseDateInput("2026-07-27")?.toISOString(), "2026-07-27T12:00:00.000Z");
  assert.equal(parseDateInput("2026-02-30"), null);
  assert.equal(parseDateInput("2026-13-01"), null);
  assert.equal(parseDateInput("27-07-2026"), null);
});
