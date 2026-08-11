import assert from "node:assert/strict";
import test from "node:test";
import {
  hasActivePushSubscription,
  haveSameApplicationServerKey,
  urlBase64ToUint8Array,
} from "./push-subscriptions.js";

const publicKey = "AQIDBA";
const applicationServerKey = Uint8Array.from([1, 2, 3, 4]);

test("convierte y compara la clave pública de una suscripción Push", () => {
  const subscription = {
    options: { applicationServerKey: applicationServerKey.buffer },
  };

  assert.deepEqual(
    Array.from(urlBase64ToUint8Array(publicKey)),
    Array.from(applicationServerKey),
  );
  assert.equal(
    haveSameApplicationServerKey(subscription, applicationServerKey),
    true,
  );
});

test("solo considera activos el permiso y la suscripción vigentes", async () => {
  const subscription = {
    options: { applicationServerKey: applicationServerKey.buffer },
  };
  const navigatorObject = {
    serviceWorker: {
      getRegistration: async () => ({
        pushManager: { getSubscription: async () => subscription },
      }),
      register: async () => undefined,
    },
  };
  const grantedWindow = {
    Notification: { permission: "granted" },
    PushManager: function PushManager() {},
  };
  const deniedWindow = {
    Notification: { permission: "denied" },
    PushManager: function PushManager() {},
  };

  assert.equal(
    await hasActivePushSubscription(publicKey, {
      navigatorObject,
      windowObject: grantedWindow,
    }),
    true,
  );
  assert.equal(
    await hasActivePushSubscription(publicKey, {
      navigatorObject,
      windowObject: deniedWindow,
    }),
    false,
  );
});
