import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const gamesPageSource = readFileSync(
  new URL("../app/(app)/app/juegos/page.jsx", import.meta.url),
  "utf8",
);

test("abre los juegos dentro de la pestaña actual", () => {
  assert.equal(gamesPageSource.includes('target="_blank"'), false);
  assert.equal(gamesPageSource.includes("en una pestaña nueva"), false);
  assert.equal(gamesPageSource.includes("href={game.href}"), true);
  assert.equal(gamesPageSource.includes("aria-label={`Jugar a ${game.name}`}"), true);
});
