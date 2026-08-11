import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createMemoryDeck,
  getPairCountForLevel,
  MAX_MEMORY_LEVEL,
} from "./memory-game.js";

test("la cantidad de pares aumenta de a uno por nivel", () => {
  assert.equal(getPairCountForLevel(1), 2);
  assert.equal(getPairCountForLevel(2), 3);
  assert.equal(getPairCountForLevel(5), 6);
  assert.equal(getPairCountForLevel(MAX_MEMORY_LEVEL), 10);
});

test("los niveles fuera de rango se limitan a valores seguros", () => {
  assert.equal(getPairCountForLevel(0), 2);
  assert.equal(getPairCountForLevel(MAX_MEMORY_LEVEL + 10), 10);
  assert.equal(getPairCountForLevel("3"), 2);
});

test("el mazo contiene exactamente dos cartas por cada par", () => {
  const deck = createMemoryDeck(4, () => 0.5);
  const pairCounts = new Map();

  for (const card of deck) {
    pairCounts.set(card.id, (pairCounts.get(card.id) || 0) + 1);
  }

  assert.equal(deck.length, 10);
  assert.equal(new Set(deck.map((card) => card.cardId)).size, deck.length);
  assert.deepEqual([...pairCounts.values()], [2, 2, 2, 2, 2]);
});

test("las cartas mantienen dimensiones fijas en todos los niveles", () => {
  const source = readFileSync(
    new URL("../features/games/memory-game.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /grid-cols-\[repeat\(auto-fit,minmax\(0,4rem\)\)\]/);
  assert.match(source, /sm:grid-cols-\[repeat\(auto-fit,minmax\(0,4\.5rem\)\)\]/);
  assert.match(source, /aspect-\[4\/5\] w-16/);
  assert.match(source, /sm:w-18/);
  assert.doesNotMatch(source, /pairCount\s*===/);
});
