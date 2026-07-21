export default function manifest() {
  return {
    id: "/",
    name: "Cuida — Cuidado compartido",
    short_name: "Cuida",
    description:
      "Organiza medicamentos, turnos, tareas y cuidados diarios con tu círculo de cuidado.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f5f8fb",
    theme_color: "#0b1f3a",
    lang: "es-AR",
    icons: [
      { src: "/cuida-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/cuida.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}
