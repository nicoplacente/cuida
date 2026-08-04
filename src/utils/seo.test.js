import assert from "node:assert/strict";
import test from "node:test";
import { createRobots } from "../app/robots.js";
import { createSitemap } from "../app/sitemap.js";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  createLandingJsonLd,
  createPublicMetadata,
  getCanonicalUrl,
  getSiteUrl,
  serializeJsonLd,
} from "./seo.js";

const publicUrl = "https://cuida.example";

test("normaliza el dominio público y usa fallbacks seguros", () => {
  assert.equal(getSiteUrl("https://cuida.example/app/"), publicUrl);
  assert.equal(getSiteUrl("dominio-invalido", "production"), "https://cuida.codeluxe.tech");
  assert.equal(getSiteUrl("dominio-invalido", "development"), "http://localhost:3000");
});

test("genera metadata completa y canónica para la landing", () => {
  const metadata = createPublicMetadata({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  });

  assert.deepEqual(metadata.title, { absolute: SITE_TITLE });
  assert.equal(metadata.alternates.canonical, "/");
  assert.equal(metadata.openGraph.url, "/");
  assert.equal(metadata.openGraph.images[0].width, 1200);
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.equal(getCanonicalUrl("/", publicUrl), `${publicUrl}/`);
});

test("publica únicamente las páginas indexables en el sitemap", () => {
  const entries = createSitemap(publicUrl);

  assert.deepEqual(
    entries.map(({ url }) => url),
    [
      `${publicUrl}/`,
      `${publicUrl}/terminos-y-condiciones`,
      `${publicUrl}/politica-de-privacidad`,
    ],
  );
  assert.equal(entries[0].priority, 1);
  assert.ok(entries.slice(1).every(({ priority }) => priority < 1));
});

test("bloquea rutas privadas y anuncia el sitemap", () => {
  const metadata = createRobots(publicUrl);
  const disallowedRoutes = metadata.rules.disallow;

  assert.ok(disallowedRoutes.includes("/app"));
  assert.ok(disallowedRoutes.includes("/api"));
  assert.ok(disallowedRoutes.includes("/invitacion/"));
  assert.equal(metadata.sitemap, `${publicUrl}/sitemap.xml`);
  assert.equal(metadata.host, publicUrl);
});

test("describe la landing sin permitir etiquetas HTML en JSON-LD", () => {
  const jsonLd = createLandingJsonLd(publicUrl);
  const serialized = serializeJsonLd({ ...jsonLd, name: "<Cuida>" });

  assert.equal(jsonLd.url, `${publicUrl}/`);
  assert.equal(jsonLd.isAccessibleForFree, true);
  assert.equal(jsonLd.creator.name, "Codeluxe");
  assert.equal(serialized.includes("<"), false);
  assert.ok(serialized.includes("\\u003cCuida>"));
});
