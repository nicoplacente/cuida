import assert from "node:assert/strict";
import test from "node:test";
import {
  checkCrossword,
  getCrosswordLevel,
  getEntriesForCell,
  isCrosswordComplete,
  MAX_CROSSWORD_LEVEL,
  normalizeCrosswordAnswer,
} from "./crossword.js";

test("normaliza respuestas para compararlas sin tildes ni espacios", () => {
  assert.equal(normalizeCrosswordAnswer("  alegría "), "ALEGRIA");
});

test("crea todos los niveles con cruces válidos y dificultad gradual", () => {
  let previousSize = 0;
  let previousEntryCount = 0;

  for (let levelNumber = 1; levelNumber <= MAX_CROSSWORD_LEVEL; levelNumber += 1) {
    const level = getCrosswordLevel(levelNumber);

    assert.ok(level.size >= previousSize);
    assert.ok(level.entries.length >= previousEntryCount);
    assert.equal(level.grid.length, level.size * level.size);
    assert.ok(level.activeCellCount > 0);

    level.entries.forEach((entry) => {
      assert.equal(entry.answer.length, entry.path.length);
      entry.path.forEach((cellIndex, letterIndex) => {
        assert.equal(level.grid[cellIndex].solution, entry.answer[letterIndex]);
      });
    });

    previousSize = level.size;
    previousEntryCount = level.entries.length;
  }
});

test("asigna el mismo número a las pistas que comienzan en la misma casilla", () => {
  const level = getCrosswordLevel(1);
  const sharedEntries = getEntriesForCell(level, level.entries[0].path[0]);

  assert.equal(sharedEntries.length, 2);
  assert.equal(sharedEntries[0].number, sharedEntries[1].number);
});

test("detecta respuestas completas y casillas incorrectas", () => {
  const level = getCrosswordLevel(1);
  const solvedValues = Object.fromEntries(
    level.grid.filter(Boolean).map((cell) => [cell.index, cell.solution]),
  );

  assert.equal(isCrosswordComplete(level, solvedValues), true);
  assert.equal(checkCrossword(level, solvedValues).correctEntryIds.length, level.entries.length);

  const wrongCellIndex = level.entries[0].path[1];
  const wrongValues = { ...solvedValues, [wrongCellIndex]: "X" };
  const result = checkCrossword(level, wrongValues);

  assert.equal(result.complete, false);
  assert.deepEqual(result.incorrectCellIndices, [wrongCellIndex]);
});

test("limita niveles fuera de rango", () => {
  assert.equal(getCrosswordLevel(0).levelNumber, 1);
  assert.equal(getCrosswordLevel(99).levelNumber, MAX_CROSSWORD_LEVEL);
});
