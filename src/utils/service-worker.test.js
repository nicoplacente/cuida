import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const serviceWorkerSource = readFileSync(
  new URL("../../public/sw.js", import.meta.url),
  "utf8",
);

function createServiceWorker() {
  const listeners = new Map();
  const displayedNotifications = [];

  const context = {
    URL,
    clients: {
      matchAll: async () => [],
      openWindow: async () => undefined,
    },
    self: {
      clients: { claim: async () => undefined },
      location: { origin: "https://cuida.example" },
      registration: {
        showNotification: async (title, options) => {
          displayedNotifications.push({ title, options });
        },
      },
      skipWaiting: () => undefined,
      addEventListener: (name, listener) => listeners.set(name, listener),
    },
  };

  vm.runInNewContext(serviceWorkerSource, context);
  return { displayedNotifications, listeners };
}

test("solicita sonido y vibración para las notificaciones Push", async () => {
  const { displayedNotifications, listeners } = createServiceWorker();
  let notificationPromise;

  listeners.get("push")({
    data: {
      json: () => ({
        title: "Momento de la medicación",
        body: "Donepezilo 10 mg está programado para las 08:00.",
        notificationId: "notification-1",
        timestamp: 1785210300000,
        url: "/app/medicamentos",
      }),
    },
    waitUntil: (promise) => {
      notificationPromise = promise;
    },
  });

  await notificationPromise;

  assert.equal(displayedNotifications.length, 1);
  assert.equal(displayedNotifications[0].options.silent, false);
  assert.equal(displayedNotifications[0].options.lang, "es-AR");
  assert.deepEqual(
    Array.from(displayedNotifications[0].options.vibrate),
    [200, 100, 200],
  );
  assert.equal(displayedNotifications[0].options.renotify, true);
  assert.equal(displayedNotifications[0].options.tag, "notification-1");
});

test("evita renotificar sin una etiqueta válida", async () => {
  const { displayedNotifications, listeners } = createServiceWorker();
  let notificationPromise;

  listeners.get("push")({
    data: {
      json: () => ({ body: "Tenés un nuevo aviso." }),
    },
    waitUntil: (promise) => {
      notificationPromise = promise;
    },
  });

  await notificationPromise;

  assert.equal(displayedNotifications[0].title, "Cuida");
  assert.equal(displayedNotifications[0].options.renotify, false);
  assert.equal(displayedNotifications[0].options.silent, false);
});
