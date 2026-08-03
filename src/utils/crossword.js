export const MAX_CROSSWORD_LEVEL = 8;

const LEVEL_SPECS = [
  {
    title: "Primeros cruces",
    size: 7,
    entries: [
      { answer: "CALMA", clue: "Estado de tranquilidad.", row: 1, column: 3, direction: "down" },
      { answer: "CASA", clue: "Lugar donde vivimos.", row: 1, column: 3, direction: "across" },
      { answer: "PAZ", clue: "Sensación de armonía y quietud.", row: 2, column: 2, direction: "across" },
    ],
  },
  {
    title: "Un lugar querido",
    size: 7,
    entries: [
      { answer: "HOGAR", clue: "Casa sentida como propia.", row: 1, column: 3, direction: "down" },
      { answer: "AMOR", clue: "Afecto profundo hacia alguien.", row: 2, column: 1, direction: "across" },
      { answer: "AGUA", clue: "Bebida esencial para hidratarse.", row: 3, column: 2, direction: "across" },
      { answer: "CASA", clue: "Espacio donde compartimos la vida diaria.", row: 4, column: 2, direction: "across" },
    ],
  },
  {
    title: "Vínculos cercanos",
    size: 8,
    entries: [
      { answer: "FAMILIA", clue: "Personas unidas por afecto y pertenencia.", row: 0, column: 4, direction: "down" },
      { answer: "FARO", clue: "Luz que sirve como guía.", row: 0, column: 4, direction: "across" },
      { answer: "AMOR", clue: "Cariño que se demuestra con acciones.", row: 1, column: 4, direction: "across" },
      { answer: "CAMINO", clue: "Recorrido para llegar a un lugar.", row: 2, column: 2, direction: "across" },
      { answer: "RISAS", clue: "Sonidos espontáneos de alegría.", row: 3, column: 3, direction: "across" },
    ],
  },
  {
    title: "Gestos cotidianos",
    size: 8,
    entries: [
      { answer: "CUIDAR", clue: "Acompañar con atención y afecto.", row: 1, column: 4, direction: "down" },
      { answer: "CASA", clue: "Lugar que ofrece abrigo y pertenencia.", row: 1, column: 4, direction: "across" },
      { answer: "LUZ", clue: "Claridad que permite ver.", row: 2, column: 3, direction: "across" },
      { answer: "AIRE", clue: "Lo respiramos a cada momento.", row: 3, column: 3, direction: "across" },
      { answer: "IDEA", clue: "Pensamiento que surge en la mente.", row: 4, column: 3, direction: "across" },
      { answer: "AMOR", clue: "Sentimiento que impulsa el cuidado.", row: 5, column: 4, direction: "across" },
    ],
  },
  {
    title: "Momentos de alegría",
    size: 9,
    entries: [
      { answer: "ALEGRIA", clue: "Emoción que invita a sonreír.", row: 1, column: 4, direction: "down" },
      { answer: "AMOR", clue: "Afecto sincero por otra persona.", row: 1, column: 4, direction: "across" },
      { answer: "SOL", clue: "Estrella que ilumina nuestros días.", row: 2, column: 2, direction: "across" },
      { answer: "RED", clue: "Conjunto de personas que se apoyan.", row: 3, column: 3, direction: "across" },
      { answer: "AGUA", clue: "Líquido transparente que bebemos.", row: 4, column: 3, direction: "across" },
      { answer: "RISAS", clue: "Expresiones sonoras de diversión.", row: 5, column: 4, direction: "across" },
    ],
  },
  {
    title: "Una sonrisa compartida",
    size: 9,
    entries: [
      { answer: "SONRISA", clue: "Gesto del rostro que expresa alegría.", row: 1, column: 4, direction: "down" },
      { answer: "SOL", clue: "Nos da luz y calor.", row: 1, column: 4, direction: "across" },
      { answer: "HOGAR", clue: "Lugar propio donde nos sentimos a salvo.", row: 2, column: 3, direction: "across" },
      { answer: "UNION", clue: "Vínculo que reúne a las personas.", row: 3, column: 3, direction: "across" },
      { answer: "AIRE", clue: "Elemento invisible que respiramos.", row: 4, column: 2, direction: "across" },
      { answer: "VIDA", clue: "Experiencia que compartimos cada día.", row: 5, column: 3, direction: "across" },
    ],
  },
  {
    title: "Tiempo y compañía",
    size: 10,
    entries: [
      { answer: "PACIENCIA", clue: "Capacidad de esperar con serenidad.", row: 0, column: 5, direction: "down" },
      { answer: "PAZ", clue: "Estado libre de inquietud.", row: 0, column: 5, direction: "across" },
      { answer: "CALMA", clue: "Tranquilidad ante una situación.", row: 1, column: 4, direction: "across" },
      { answer: "CASA", clue: "Construcción preparada para habitar.", row: 2, column: 5, direction: "across" },
      { answer: "AIRE", clue: "Mezcla de gases que nos rodea.", row: 3, column: 4, direction: "across" },
      { answer: "RED", clue: "Grupo cercano disponible para ayudar.", row: 4, column: 4, direction: "across" },
      { answer: "UNION", clue: "Acción de juntar o enlazar.", row: 5, column: 4, direction: "across" },
    ],
  },
  {
    title: "Bienestar en equilibrio",
    size: 10,
    entries: [
      { answer: "BIENESTAR", clue: "Estado de equilibrio físico y emocional.", row: 0, column: 5, direction: "down" },
      { answer: "BIEN", clue: "De manera correcta o favorable.", row: 0, column: 5, direction: "across" },
      { answer: "VIDA", clue: "Etapa que construimos día a día.", row: 1, column: 4, direction: "across" },
      { answer: "RED", clue: "Personas conectadas para acompañarse.", row: 2, column: 4, direction: "across" },
      { answer: "UNION", clue: "Relación cercana entre varias personas.", row: 3, column: 4, direction: "across" },
      { answer: "SER", clue: "Existir o tener una cualidad.", row: 4, column: 4, direction: "across" },
      { answer: "SOL", clue: "Astro central de nuestro sistema.", row: 5, column: 5, direction: "across" },
    ],
  },
];

const levelCache = new Map();

export function normalizeCrosswordAnswer(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-ZÑ]/gi, "")
    .toUpperCase();
}

function getEntryPath(entry, size) {
  const answer = normalizeCrosswordAnswer(entry.answer);

  return Array.from({ length: answer.length }, (_, offset) => {
    const row = entry.row + (entry.direction === "down" ? offset : 0);
    const column = entry.column + (entry.direction === "across" ? offset : 0);

    if (row < 0 || row >= size || column < 0 || column >= size) {
      throw new Error(`La respuesta ${entry.answer} queda fuera del tablero.`);
    }

    return row * size + column;
  });
}

function buildLevel(spec, levelNumber) {
  const solutions = new Map();
  const rawEntries = spec.entries.map((entry, entryIndex) => {
    const answer = normalizeCrosswordAnswer(entry.answer);
    const path = getEntryPath(entry, spec.size);

    path.forEach((cellIndex, letterIndex) => {
      const currentLetter = solutions.get(cellIndex);
      const nextLetter = answer[letterIndex];

      if (currentLetter && currentLetter !== nextLetter) {
        throw new Error(`Las respuestas del nivel ${levelNumber} tienen un cruce inválido.`);
      }

      solutions.set(cellIndex, nextLetter);
    });

    return {
      ...entry,
      answer,
      display: entry.answer,
      id: `level-${levelNumber}-entry-${entryIndex + 1}`,
      path,
    };
  });
  const startCellIndices = [...new Set(rawEntries.map((entry) => entry.path[0]))].sort(
    (first, second) => first - second,
  );
  const clueNumbers = new Map(
    startCellIndices.map((cellIndex, index) => [cellIndex, index + 1]),
  );
  const entries = rawEntries.map((entry) => ({
    ...entry,
    number: clueNumbers.get(entry.path[0]),
  }));
  const grid = Array.from({ length: spec.size * spec.size }, (_, cellIndex) => {
    const solution = solutions.get(cellIndex);

    if (!solution) {
      return null;
    }

    return {
      column: cellIndex % spec.size,
      entryIds: entries
        .filter((entry) => entry.path.includes(cellIndex))
        .map((entry) => entry.id),
      index: cellIndex,
      number: clueNumbers.get(cellIndex) ?? null,
      row: Math.floor(cellIndex / spec.size),
      solution,
    };
  });

  return {
    entries,
    grid,
    levelNumber,
    size: spec.size,
    title: spec.title,
    activeCellCount: solutions.size,
  };
}

export function getCrosswordLevel(levelNumber) {
  const safeLevelNumber = Math.min(
    Math.max(Number.isInteger(levelNumber) ? levelNumber : 1, 1),
    MAX_CROSSWORD_LEVEL,
  );

  if (!levelCache.has(safeLevelNumber)) {
    levelCache.set(
      safeLevelNumber,
      buildLevel(LEVEL_SPECS[safeLevelNumber - 1], safeLevelNumber),
    );
  }

  return levelCache.get(safeLevelNumber);
}

export function getEntriesForCell(level, cellIndex) {
  const entryIds = level.grid[cellIndex]?.entryIds ?? [];
  return entryIds.map((entryId) => level.entries.find((entry) => entry.id === entryId));
}

export function checkCrossword(level, values = {}) {
  const correctEntryIds = [];
  const incompleteEntryIds = [];
  const incorrectEntryIds = [];

  level.entries.forEach((entry) => {
    const enteredAnswer = entry.path.map((cellIndex) => values[cellIndex] ?? "").join("");

    if (enteredAnswer === entry.answer) {
      correctEntryIds.push(entry.id);
    } else if (enteredAnswer.length < entry.answer.length) {
      incompleteEntryIds.push(entry.id);
    } else {
      incorrectEntryIds.push(entry.id);
    }
  });

  const incorrectCellIndices = level.grid
    .filter(Boolean)
    .filter((cell) => values[cell.index] && values[cell.index] !== cell.solution)
    .map((cell) => cell.index);

  return {
    complete: correctEntryIds.length === level.entries.length,
    correctEntryIds,
    incompleteEntryIds,
    incorrectCellIndices,
    incorrectEntryIds,
  };
}

export function isCrosswordComplete(level, values) {
  return checkCrossword(level, values).complete;
}
