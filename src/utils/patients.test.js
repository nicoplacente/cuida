import assert from "node:assert/strict";
import test from "node:test";
import { calculateAge, getPatientAge } from "./patients.js";

test("calcula la edad antes, durante y después del cumpleaños", () => {
  assert.equal(calculateAge("2004-10-04", "2026-10-03"), 21);
  assert.equal(calculateAge("2004-10-04", "2026-10-04"), 22);
  assert.equal(calculateAge("2004-10-04", "2026-10-05"), 22);
});

test("conserva la edad histórica cuando falta la fecha de nacimiento", () => {
  assert.equal(getPatientAge({ age: 82, birthDate: null }, "2026-08-01"), 82);
});

test("rechaza fechas futuras o inválidas", () => {
  assert.equal(calculateAge("2030-01-01", "2026-08-01"), null);
  assert.equal(calculateAge("fecha-inválida", "2026-08-01"), null);
});
