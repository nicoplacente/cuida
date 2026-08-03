import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../../next.config.mjs";

test("protege las rutas que contienen tokens sensibles", async () => {
  const configuredHeaders = await nextConfig.headers();
  const expectedHeaders = [
    { key: "Cache-Control", value: "no-store" },
    { key: "Referrer-Policy", value: "no-referrer" },
  ];

  for (const source of [
    "/restablecer-contrasena/:path*",
    "/invitacion/:path*",
  ]) {
    const route = configuredHeaders.find((entry) => entry.source === source);
    assert.deepEqual(route?.headers, expectedHeaders);
  }
});
