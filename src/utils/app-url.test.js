import assert from "node:assert/strict";
import test from "node:test";
import {
  getAppOrigin,
  isAppOrigin,
  isRequestFromAppOrigin,
} from "./app-url.js";

test("normaliza el origen público configurado", () => {
  assert.equal(
    getAppOrigin("https://cuida.codeluxe.tech/app/"),
    "https://cuida.codeluxe.tech",
  );
  assert.equal(getAppOrigin("http://localhost:3000/"), "http://localhost:3000");
});

test("acepta únicamente el origen público exacto", () => {
  const appUrl = "https://cuida.codeluxe.tech/app";

  assert.equal(isAppOrigin("https://cuida.codeluxe.tech", appUrl), true);
  assert.equal(isAppOrigin("https://otro.example", appUrl), false);
  assert.equal(isAppOrigin("https://cuida.codeluxe.tech.evil.example", appUrl), false);
  assert.equal(isAppOrigin("https://cuida.codeluxe.tech/app", appUrl), false);
  assert.equal(isAppOrigin(null, appUrl), false);
});

test("rechaza configuraciones públicas inválidas", () => {
  assert.equal(getAppOrigin("dominio-invalido"), null);
  assert.equal(getAppOrigin("ftp://cuida.codeluxe.tech"), null);
  assert.equal(isAppOrigin("https://cuida.codeluxe.tech", "dominio-invalido"), false);
});

test("acepta el origen público aunque el proxy use una URL interna", () => {
  const request = new Request("http://servicio-interno:3000/api/push/subscriptions", {
    headers: { origin: "https://cuida.codeluxe.tech" },
  });

  assert.equal(
    isRequestFromAppOrigin(request, "https://cuida.codeluxe.tech"),
    true,
  );
});

test("rechaza solicitudes externas o sin origen", () => {
  const externalRequest = new Request(
    "http://servicio-interno:3000/api/push/subscriptions",
    { headers: { origin: "https://sitio-malicioso.example" } },
  );
  const missingOriginRequest = new Request(
    "http://servicio-interno:3000/api/push/subscriptions",
  );

  assert.equal(
    isRequestFromAppOrigin(externalRequest, "https://cuida.codeluxe.tech"),
    false,
  );
  assert.equal(
    isRequestFromAppOrigin(missingOriginRequest, "https://cuida.codeluxe.tech"),
    false,
  );
});
