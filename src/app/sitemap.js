import { getCanonicalUrl, getSiteUrl } from "../utils/seo.js";

const LAST_UPDATED = new Date("2026-08-04T00:00:00-03:00");

export function createSitemap(siteUrl = getSiteUrl()) {
  return [
    {
      url: getCanonicalUrl("/", siteUrl),
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: getCanonicalUrl("/terminos-y-condiciones", siteUrl),
      lastModified: LAST_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getCanonicalUrl("/politica-de-privacidad", siteUrl),
      lastModified: LAST_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

export default function sitemap() {
  return createSitemap();
}
