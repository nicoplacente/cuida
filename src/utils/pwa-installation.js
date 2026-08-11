export const APP_SETUP_ALERT_SESSION_KEY = "cuida-app-setup-alert-seen-v1";

export function wasSetupAlertShown(storage) {
  try {
    return storage.getItem(APP_SETUP_ALERT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSetupAlertShown(storage) {
  try {
    storage.setItem(APP_SETUP_ALERT_SESSION_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

function isIosDevice(navigatorObject) {
  const userAgent = navigatorObject?.userAgent || "";
  const platform = navigatorObject?.platform || "";
  const maxTouchPoints = navigatorObject?.maxTouchPoints || 0;

  return (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

export function getInstallGuide(navigatorObject = globalThis.navigator) {
  const userAgent = navigatorObject?.userAgent || "";

  if (isIosDevice(navigatorObject)) {
    return {
      intro: "Abrí Cuida en Safari y seguí estos pasos:",
      steps: [
        "Tocá el botón Compartir de Safari.",
        "Elegí “Agregar a inicio”.",
        "Activá “Abrir como aplicación”, si aparece, y confirmá con “Agregar”.",
      ],
      title: "Instalar Cuida en iPhone o iPad",
    };
  }

  if (/Android/i.test(userAgent)) {
    return {
      intro: "Desde el menú de tu navegador:",
      steps: [
        "Abrí el menú de opciones del navegador.",
        "Elegí “Instalar aplicación” o “Agregar a pantalla principal”.",
        "Activá “Abrir como aplicación”, si aparece, y confirmá la instalación.",
      ],
      title: "Instalar Cuida en Android",
    };
  }

  return {
    intro: "Desde este navegador:",
    steps: [
      "Buscá el icono de instalación en la barra de direcciones o abrí el menú del navegador.",
      "Elegí “Instalar Cuida” o “Instalar aplicación”.",
      "Confirmá la instalación para abrir Cuida como una aplicación independiente.",
    ],
    title: "Instalar Cuida en este dispositivo",
  };
}

export function getSetupAlertMessage(guide) {
  const installSteps = guide.steps.map((step, index) => `${index + 1}. ${step}`);

  return [
    "Instalá Cuida y activá las notificaciones para recibir recordatorios importantes.",
    "",
    "Instalar la aplicación:",
    guide.intro,
    ...installSteps,
    "",
    "Activar las notificaciones:",
    "1. Abrí Cuida desde el icono instalado en tu dispositivo.",
    "2. Entrá en “Avisos” desde el encabezado.",
    "3. Elegí “Activar avisos en este dispositivo”.",
  ].join("\n");
}
