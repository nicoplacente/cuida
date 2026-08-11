import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_SETUP_ALERT_SESSION_KEY,
  getInstallGuide,
  getSetupAlertMessage,
  markSetupAlertShown,
  wasSetupAlertShown,
} from "./pwa-installation.js";

test("registra el aviso únicamente durante la sesión actual", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.equal(wasSetupAlertShown(storage), false);
  assert.equal(markSetupAlertShown(storage), true);
  assert.equal(values.get(APP_SETUP_ALERT_SESSION_KEY), "1");
  assert.equal(wasSetupAlertShown(storage), true);
});

test("adapta la guía de instalación para iOS y Android", () => {
  const iosGuide = getInstallGuide({
    maxTouchPoints: 5,
    platform: "MacIntel",
    userAgent: "Safari",
  });
  const androidGuide = getInstallGuide({
    platform: "Linux armv8l",
    userAgent: "Mozilla/5.0 Android 16 Chrome/140",
  });

  assert.equal(iosGuide.title, "Instalar Cuida en iPhone o iPad");
  assert.equal(androidGuide.title, "Instalar Cuida en Android");
});

test("la alerta guía la instalación y la activación desde Avisos", () => {
  const message = getSetupAlertMessage(
    getInstallGuide({ platform: "Win32", userAgent: "Chrome" }),
  );

  assert.match(message, /Instalá Cuida/);
  assert.match(message, /Instalar la aplicación/);
  assert.match(message, /Entrá en “Avisos”/);
  assert.match(message, /Activar avisos en este dispositivo/);
});
