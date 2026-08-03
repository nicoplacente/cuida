import assert from "node:assert/strict";
import test from "node:test";
import {
  findWordForSelection,
  getLineIndices,
  getWordSearchLevel,
  MAX_WORD_SEARCH_LEVEL,
  normalizeSearchWord,
} from "./word-search.js";

test("normaliza palabras con tildes para el tablero", () => {
  assert.equal(normalizeSearchWord("Unión"), "UNION");
  assert.equal(normalizeSearchWord("Alegría"), "ALEGRIA");
});

test("todos los niveles contienen las palabras en sus coordenadas", () => {
  for (let levelNumber = 1; levelNumber <= MAX_WORD_SEARCH_LEVEL; levelNumber += 1) {
    const level = getWordSearchLevel(levelNumber);

    for (const word of level.words) {
      const letters = word.path.map((cellIndex) => level.grid[cellIndex]).join("");

      assert.equal(letters, word.normalized);
      assert.ok(word.path.every((cellIndex) => cellIndex >= 0 && cellIndex < level.grid.length));
    }
  }
});

test("la dificultad aumenta sin reducir tablero ni cantidad de palabras", () => {
  let previousSize = 0;
  let previousWordCount = 0;

  for (let levelNumber = 1; levelNumber <= MAX_WORD_SEARCH_LEVEL; levelNumber += 1) {
    const level = getWordSearchLevel(levelNumber);

    assert.ok(level.size >= previousSize);
    assert.ok(level.words.length >= previousWordCount);
    previousSize = level.size;
    previousWordCount = level.words.length;
  }
});

test("calcula selecciones horizontales, verticales, diagonales y reversas", () => {
  assert.deepEqual(getLineIndices(0, 3, 6), [0, 1, 2, 3]);
  assert.deepEqual(getLineIndices(0, 18, 6), [0, 6, 12, 18]);
  assert.deepEqual(getLineIndices(0, 21, 6), [0, 7, 14, 21]);
  assert.deepEqual(getLineIndices(3, 0, 6), [3, 2, 1, 0]);
  assert.deepEqual(getLineIndices(0, 8, 6), []);
});

test("reconoce una palabra seleccionada en cualquiera de los dos sentidos", () => {
  const level = getWordSearchLevel(1);
  const word = level.words[0];

  assert.equal(findWordForSelection(level, word.path[0], word.path.at(-1))?.id, word.id);
  assert.equal(findWordForSelection(level, word.path.at(-1), word.path[0])?.id, word.id);
  assert.equal(findWordForSelection(level, 0, 5), null);
});
