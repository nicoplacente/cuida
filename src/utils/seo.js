import { getAppOrigin, getAppUrl } from "./app-url.js";

const LOCAL_SITE_URL = "http://localhost:3000";
const PRODUCTION_SITE_URL = "https://cuida.codeluxe.tech";

export const SITE_NAME = "Cuida";
export const SITE_TITLE = "Cuida | Cuidado compartido para familias";
export const SITE_DESCRIPTION =
  "Organizá medicamentos, turnos, tareas y cuidados diarios de tus seres queridos en un solo lugar.";
export const SITE_LANGUAGE = "es-AR";
export const SITE_LOCALE = "es_AR";
export const SOCIAL_IMAGE = {
  url: "/og-cuida.png",
  width: 1200,
  height: 630,
  alt: "Cuida — Cuidamos juntos, cada día.",
};

export const PRIVATE_ROBOTS = {
  index: false,
  follow: false,
};

export function getSiteUrl(
  appUrl = getAppUrl(),
  nodeEnv = process.env.NODE_ENV,
) {
  const appOrigin = getAppOrigin(appUrl);

  if (appOrigin) return appOrigin;

  return nodeEnv === "production" ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;
}

export function getCanonicalUrl(path = "/", siteUrl = getSiteUrl()) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function createPublicMetadata({ description, path, title }) {
  const isLanding = path === "/";
  const socialTitle = isLanding ? title : `${title} | ${SITE_NAME}`;

  return {
    title: isLanding ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

export function createLandingJsonLd(siteUrl = getSiteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: getCanonicalUrl("/", siteUrl),
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: SITE_LANGUAGE,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ARS",
    },
    creator: {
      "@type": "Organization",
      name: "Codeluxe",
      url: "https://codeluxe.tech",
    },
  };
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
