export function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = globalThis.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

export function haveSameApplicationServerKey(subscription, applicationServerKey) {
  const currentKey = subscription.options.applicationServerKey;
  if (!currentKey) return false;

  const currentBytes = new Uint8Array(currentKey);
  return (
    currentBytes.length === applicationServerKey.length &&
    currentBytes.every((byte, index) => byte === applicationServerKey[index])
  );
}

export async function getServiceWorkerRegistration(
  navigatorObject = globalThis.navigator,
) {
  return (
    (await navigatorObject.serviceWorker.getRegistration()) ||
    (await navigatorObject.serviceWorker.register("/sw.js"))
  );
}

export async function hasActivePushSubscription(
  publicKey,
  {
    navigatorObject = globalThis.navigator,
    windowObject = globalThis.window,
  } = {},
) {
  if (
    !navigatorObject ||
    !windowObject ||
    !("serviceWorker" in navigatorObject) ||
    !("PushManager" in windowObject) ||
    !("Notification" in windowObject) ||
    windowObject.Notification.permission !== "granted"
  ) {
    return false;
  }

  try {
    const registration = await getServiceWorkerRegistration(navigatorObject);
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    return (
      !publicKey ||
      haveSameApplicationServerKey(
        subscription,
        urlBase64ToUint8Array(publicKey),
      )
    );
  } catch {
    return false;
  }
}
