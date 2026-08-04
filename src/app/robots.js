import { getSiteUrl } from "../utils/seo.js";

const DISALLOWED_ROUTES = [
  "/api",
  "/app",
  "/login",
  "/registro",
  "/olvide-contrasena",
  "/restablecer-contrasena/",
  "/invitacion/",
];

export function createRobots(siteUrl = getSiteUrl()) {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/terminos-y-condiciones", "/politica-de-privacidad"],
      disallow: DISALLOWED_ROUTES,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

export default function robots() {
  return createRobots();
}
