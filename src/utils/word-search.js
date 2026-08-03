export const MAX_WORD_SEARCH_LEVEL = 8;

const FILLER_LETTERS = "AEIOULNRSTCMDPBGFV";
const levelCache = new Map();

const levelSpecs = [
  {
    title: "Un momento de calma",
    size: 6,
    words: [
      { display: "Calma", row: 0, column: 0, direction: [0, 1] },
      { display: "Hogar", row: 1, column: 0, direction: [1, 0] },
      { display: "Sol", row: 2, column: 2, direction: [1, 0] },
    ],
  },
  {
    title: "Cerca de quienes queremos",
    size: 6,
    words: [
      { display: "Amor", row: 0, column: 0, direction: [0, 1] },
      { display: "Casa", row: 1, column: 1, direction: [0, 1] },
      { display: "Paz", row: 2, column: 5, direction: [1, 0] },
      { display: "Red", row: 5, column: 0, direction: [0, 1] },
    ],
  },
  {
    title: "Vínculos que acompañan",
    size: 7,
    words: [
      { display: "Abrazo", row: 0, column: 0, direction: [0, 1] },
      { display: "Familia", row: 0, column: 6, direction: [1, 0] },
      { display: "Risas", row: 1, column: 0, direction: [1, 1] },
      { display: "Unión", row: 6, column: 0, direction: [0, 1] },
    ],
  },
  {
    title: "El ritmo del cuidado",
    size: 7,
    words: [
      { display: "Cuidar", row: 0, column: 0, direction: [0, 1] },
      { display: "Sueño", row: 1, column: 0, direction: [1, 0] },
      { display: "Rutina", row: 1, column: 1, direction: [0, 1] },
      { display: "Ayuda", row: 2, column: 6, direction: [1, 0] },
      { display: "Tiempo", row: 6, column: 0, direction: [0, 1] },
    ],
  },
  {
    title: "Pequeñas alegrías",
    size: 8,
    words: [
      { display: "Alegría", row: 0, column: 7, direction: [0, -1] },
      { display: "Paseo", row: 1, column: 0, direction: [0, 1] },
      { display: "Jardín", row: 2, column: 0, direction: [0, 1] },
      { display: "Música", row: 3, column: 7, direction: [0, -1] },
      { display: "Amigos", row: 4, column: 0, direction: [0, 1] },
    ],
  },
  {
    title: "Hábitos que hacen bien",
    size: 8,
    words: [
      { display: "Energía", row: 0, column: 0, direction: [0, 1] },
      { display: "Caminar", row: 1, column: 0, direction: [0, 1] },
      { display: "Sonrisa", row: 0, column: 7, direction: [1, 0] },
      { display: "Respirar", row: 7, column: 0, direction: [0, 1] },
      { display: "Agua", row: 3, column: 0, direction: [1, 0] },
      { display: "Aire", row: 3, column: 2, direction: [1, 1] },
    ],
  },
  {
    title: "Cuidarnos en equipo",
    size: 9,
    words: [
      { display: "Memoria", row: 0, column: 0, direction: [0, 1] },
      { display: "Paciencia", row: 1, column: 0, direction: [0, 1] },
      { display: "Escucha", row: 2, column: 0, direction: [0, 1] },
      { display: "Ternura", row: 3, column: 8, direction: [0, -1] },
      { display: "Confiar", row: 4, column: 0, direction: [0, 1] },
      { display: "Cercanía", row: 5, column: 8, direction: [0, -1] },
    ],
  },
  {
    title: "Todo lo que compartimos",
    size: 9,
    words: [
      { display: "Bienestar", row: 0, column: 0, direction: [0, 1] },
      { display: "Compartir", row: 1, column: 8, direction: [0, -1] },
      { display: "Presente", row: 2, column: 0, direction: [0, 1] },
      { display: "Armonía", row: 3, column: 8, direction: [0, -1] },
      { display: "Fortaleza", row: 4, column: 0, direction: [0, 1] },
      { display: "Comunidad", row: 5, column: 8, direction: [0, -1] },
      { display: "Gratitud", row: 6, column: 0, direction: [0, 1] },
    ],
  },
];

export function normalizeSearchWord(word) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function normalizeLevel(level) {
  if (!Number.isInteger(level)) {
    return 1;
  }

  return Math.min(Math.max(level, 1), MAX_WORD_SEARCH_LEVEL);
}

function createPath(startIndex, direction, length, size) {
  const [rowStep, columnStep] = direction;
  const startRow = Math.floor(startIndex / size);
  const startColumn = startIndex % size;

  return Array.from({ length }, (_, offset) => {
    const row = startRow + rowStep * offset;
    const column = startColumn + columnStep * offset;

    if (row < 0 || row >= size || column < 0 || column >= size) {
      throw new Error("Una palabra de la sopa de letras queda fuera del tablero.");
    }

    return row * size + column;
  });
}

function buildLevel(level) {
  const spec = levelSpecs[level - 1];
  const grid = Array.from(
    { length: spec.size * spec.size },
    (_, index) => FILLER_LETTERS[(index + level * 3) % FILLER_LETTERS.length],
  );
  const occupiedLetters = new Map();

  const words = spec.words.map((wordSpec) => {
    const normalized = normalizeSearchWord(wordSpec.display);
    const startIndex = wordSpec.row * spec.size + wordSpec.column;
    const path = createPath(startIndex, wordSpec.direction, normalized.length, spec.size);

    path.forEach((cellIndex, letterIndex) => {
      const letter = normalized[letterIndex];
      const occupiedLetter = occupiedLetters.get(cellIndex);

      if (occupiedLetter && occupiedLetter !== letter) {
        throw new Error(`Las palabras del nivel ${level} se superponen de forma inválida.`);
      }

      occupiedLetters.set(cellIndex, letter);
      grid[cellIndex] = letter;
    });

    return {
      id: normalized.toLowerCase(),
      display: wordSpec.display,
      normalized,
      path,
    };
  });

  return {
    level,
    title: spec.title,
    size: spec.size,
    grid,
    words,
  };
}

export function getWordSearchLevel(level) {
  const normalizedLevel = normalizeLevel(level);

  if (!levelCache.has(normalizedLevel)) {
    levelCache.set(normalizedLevel, buildLevel(normalizedLevel));
  }

  return levelCache.get(normalizedLevel);
}

export function getLineIndices(startIndex, endIndex, size) {
  const startRow = Math.floor(startIndex / size);
  const startColumn = startIndex % size;
  const endRow = Math.floor(endIndex / size);
  const endColumn = endIndex % size;
  const rowDistance = endRow - startRow;
  const columnDistance = endColumn - startColumn;
  const isStraightLine =
    rowDistance === 0 ||
    columnDistance === 0 ||
    Math.abs(rowDistance) === Math.abs(columnDistance);

  if (!isStraightLine) {
    return [];
  }

  const length = Math.max(Math.abs(rowDistance), Math.abs(columnDistance)) + 1;
  const rowStep = Math.sign(rowDistance);
  const columnStep = Math.sign(columnDistance);

  return Array.from({ length }, (_, offset) => {
    const row = startRow + rowStep * offset;
    const column = startColumn + columnStep * offset;
    return row * size + column;
  });
}

function pathsMatch(firstPath, secondPath) {
  return (
    firstPath.length === secondPath.length &&
    firstPath.every((cellIndex, index) => cellIndex === secondPath[index])
  );
}

export function findWordForSelection(level, startIndex, endIndex) {
  const path = getLineIndices(startIndex, endIndex, level.size);

  if (path.length < 2) {
    return null;
  }

  return (
    level.words.find(
      (word) => pathsMatch(path, word.path) || pathsMatch(path, [...word.path].reverse()),
    ) || null
  );
}
