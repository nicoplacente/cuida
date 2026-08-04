import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const gameFiles = [
  "word-search-game.jsx",
  "memory-game.jsx",
  "crossword-game.jsx",
  "category-sorting-game.jsx",
];

const modalSource = readFileSync(
  new URL("../components/game-completion-modal.jsx", import.meta.url),
  "utf8",
);

test("el modal de finalización se posiciona sobre el juego y ofrece ambas acciones", () => {
  assert.equal(modalSource.includes("absolute inset-0"), true);
  assert.equal(modalSource.includes("Reiniciar nivel"), true);
  assert.equal(modalSource.includes("primaryLabel"), true);
  assert.equal(modalSource.includes('role="dialog"'), true);
});

for (const gameFile of gameFiles) {
  test(`${gameFile} reutiliza el modal en niveles intermedios y finales`, () => {
    const gameSource = readFileSync(
      new URL(`../features/games/${gameFile}`, import.meta.url),
      "utf8",
    );
    const modalUseCount = gameSource.split("<GameCompletionModal").length - 1;

    assert.equal(gameSource.includes('className="relative grid gap-6"'), true);
    assert.equal(modalUseCount, 2);
    assert.equal(gameSource.includes("onRestart="), true);
    assert.equal(gameSource.includes('primaryLabel="Volver al nivel 1"'), true);
  });
}
