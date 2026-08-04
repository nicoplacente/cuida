import assert from "node:assert/strict";
import test from "node:test";
import {
  canLeaveCareCircle,
  getNextCareCircleId,
  isCareRole,
} from "./team-permissions.js";

test("acepta únicamente los roles disponibles en un grupo de cuidado", () => {
  assert.equal(isCareRole("ADMIN"), true);
  assert.equal(isCareRole("CAREGIVER"), true);
  assert.equal(isCareRole("OBSERVER"), true);
  assert.equal(isCareRole("OWNER"), false);
});

test("impide que el último administrador abandone el grupo", () => {
  assert.equal(canLeaveCareCircle({ adminCount: 1, role: "ADMIN" }), false);
  assert.equal(canLeaveCareCircle({ adminCount: 2, role: "ADMIN" }), true);
  assert.equal(canLeaveCareCircle({ adminCount: 1, role: "CAREGIVER" }), true);
});

test("selecciona otro grupo activo después de salir o eliminar", () => {
  assert.equal(getNextCareCircleId(["actual", "siguiente"], "actual"), "siguiente");
  assert.equal(getNextCareCircleId(["actual"], "actual"), null);
});
