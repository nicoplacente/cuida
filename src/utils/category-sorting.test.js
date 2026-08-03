import assert from "node:assert/strict";
import test from "node:test";
import {
  getCategoryForWord,
  getCategorySortingLevel,
  isCorrectCategory,
  MAX_CATEGORY_SORTING_LEVEL,
} from "./category-sorting.js";

test("aumenta categorías y palabras sin reducir la dificultad", () => {
  let previousCategoryCount = 0;
  let previousWordCount = 0;

  for (let levelNumber = 1; levelNumber <= MAX_CATEGORY_SORTING_LEVEL; levelNumber += 1) {
    const level = getCategorySortingLevel(levelNumber);

    assert.ok(level.categories.length >= previousCategoryCount);
    assert.ok(level.words.length >= previousWordCount);
    previousCategoryCount = level.categories.length;
    previousWordCount = level.words.length;
  }
});

test("todos los niveles tienen palabras únicas y categorías válidas", () => {
  for (let levelNumber = 1; levelNumber <= MAX_CATEGORY_SORTING_LEVEL; levelNumber += 1) {
    const level = getCategorySortingLevel(levelNumber);
    const categoryIds = new Set(level.categories.map((category) => category.id));
    const normalizedWords = level.words.map((word) =>
      word.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    );

    assert.equal(new Set(normalizedWords).size, level.words.length);
    level.words.forEach((word) => assert.equal(categoryIds.has(word.categoryId), true));
    level.categories.forEach((category) => {
      assert.equal(
        level.words.filter((word) => word.categoryId === category.id).length,
        category.wordCount,
      );
    });
  }
});

test("valida clasificaciones correctas e incorrectas", () => {
  const level = getCategorySortingLevel(1);
  const word = level.words[0];
  const correctCategory = getCategoryForWord(level, word.id);
  const incorrectCategory = level.categories.find(
    (category) => category.id !== correctCategory.id,
  );

  assert.equal(isCorrectCategory(level, word.id, correctCategory.id), true);
  assert.equal(isCorrectCategory(level, word.id, incorrectCategory.id), false);
  assert.equal(isCorrectCategory(level, "missing-word", correctCategory.id), false);
});

test("genera un orden determinístico y limita niveles fuera de rango", () => {
  assert.deepEqual(getCategorySortingLevel(3), getCategorySortingLevel(3));
  assert.equal(getCategorySortingLevel(0).levelNumber, 1);
  assert.equal(
    getCategorySortingLevel(99).levelNumber,
    MAX_CATEGORY_SORTING_LEVEL,
  );
});
