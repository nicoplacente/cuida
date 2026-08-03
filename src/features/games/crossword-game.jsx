"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, PrimaryButton } from "@/components/ui";
import {
  checkCrossword,
  getCrosswordLevel,
  getEntriesForCell,
  MAX_CROSSWORD_LEVEL,
  normalizeCrosswordAnswer,
} from "@/utils/crossword";

const STORAGE_KEY = "cuida-crossword-progress-v1";
const GRID_COLUMN_CLASSES = {
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
};

function readSavedLevel() {
  try {
    const savedLevel = Number.parseInt(window.localStorage.getItem(STORAGE_KEY), 10);

    if (Number.isInteger(savedLevel)) {
      return Math.min(Math.max(savedLevel, 1), MAX_CROSSWORD_LEVEL);
    }
  } catch {
    return 1;
  }

  return 1;
}

function saveLevel(levelNumber) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(levelNumber));
  } catch {
    // El juego continúa aunque el navegador no permita almacenamiento local.
  }
}

function directionLabel(direction) {
  return direction === "across" ? "horizontal" : "vertical";
}

export function CrosswordGame() {
  const [levelNumber, setLevelNumber] = useState(1);
  const [values, setValues] = useState({});
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [activeCellIndex, setActiveCellIndex] = useState(null);
  const [checkedResult, setCheckedResult] = useState(null);
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState(
    "Elegí una pista y escribí una letra en cada casilla.",
  );
  const cellRefs = useRef(new Map());
  const level = useMemo(() => getCrosswordLevel(levelNumber), [levelNumber]);
  const liveResult = useMemo(() => checkCrossword(level, values), [level, values]);
  const activeEntry = level.entries.find((entry) => entry.id === activeEntryId);
  const activePath = useMemo(
    () => new Set(activeEntry?.path ?? []),
    [activeEntry],
  );
  const incorrectCells = useMemo(
    () => new Set(checkedResult?.incorrectCellIndices ?? []),
    [checkedResult],
  );
  const correctEntries = useMemo(
    () => new Set(liveResult.correctEntryIds),
    [liveResult.correctEntryIds],
  );
  const filledCellCount = level.grid.filter(
    (cell) => cell && values[cell.index],
  ).length;

  function startLevel(nextLevelNumber) {
    const nextLevel = getCrosswordLevel(nextLevelNumber);
    const firstEntry = nextLevel.entries[0];

    setLevelNumber(nextLevelNumber);
    setValues({});
    setActiveEntryId(firstEntry.id);
    setActiveCellIndex(firstEntry.path[0]);
    setCheckedResult(null);
    setStatus("playing");
    setMessage("Elegí una pista y escribí una letra en cada casilla.");
  }

  useEffect(() => {
    startLevel(readSavedLevel());
  }, []);

  function focusCell(cellIndex) {
    setActiveCellIndex(cellIndex);
    cellRefs.current.get(cellIndex)?.focus();
  }

  function selectEntry(entry, preferredCellIndex) {
    const firstEmptyCellIndex = entry.path.find((cellIndex) => !values[cellIndex]);
    const nextCellIndex = entry.path.includes(preferredCellIndex)
      ? preferredCellIndex
      : (firstEmptyCellIndex ?? entry.path[0]);

    setActiveEntryId(entry.id);
    setMessage(`Pista ${entry.number} ${directionLabel(entry.direction)}: ${entry.clue}`);
    focusCell(nextCellIndex);
  }

  function chooseEntryForCell(cellIndex, shouldToggle = false) {
    const entries = getEntriesForCell(level, cellIndex);

    if (!entries.length) {
      return;
    }

    const currentEntryIndex = entries.findIndex((entry) => entry.id === activeEntryId);
    const nextEntry =
      shouldToggle && entries.length > 1
        ? entries[(Math.max(currentEntryIndex, 0) + 1) % entries.length]
        : entries[currentEntryIndex >= 0 ? currentEntryIndex : 0];

    setActiveEntryId(nextEntry.id);
    setActiveCellIndex(cellIndex);
  }

  function handleCellFocus(event, cellIndex) {
    const entries = getEntriesForCell(level, cellIndex);

    if (!entries.some((entry) => entry.id === activeEntryId)) {
      setActiveEntryId(entries[0]?.id ?? null);
    }

    setActiveCellIndex(cellIndex);
    event.currentTarget.select();
  }

  function handleCellChange(cellIndex, rawValue) {
    if (status !== "playing") {
      return;
    }

    const letter = normalizeCrosswordAnswer(rawValue).slice(-1);
    setValues((currentValues) => ({
      ...currentValues,
      [cellIndex]: letter,
    }));
    setCheckedResult(null);

    if (!letter) {
      return;
    }

    const entry =
      level.entries.find(
        (candidate) => candidate.id === activeEntryId && candidate.path.includes(cellIndex),
      ) ?? getEntriesForCell(level, cellIndex)[0];
    const position = entry?.path.indexOf(cellIndex) ?? -1;
    const nextCellIndex = entry?.path[position + 1];

    if (nextCellIndex !== undefined) {
      focusCell(nextCellIndex);
    }
  }

  function findCellInDirection(cellIndex, rowOffset, columnOffset) {
    let row = Math.floor(cellIndex / level.size) + rowOffset;
    let column = (cellIndex % level.size) + columnOffset;

    while (row >= 0 && row < level.size && column >= 0 && column < level.size) {
      const nextCellIndex = row * level.size + column;

      if (level.grid[nextCellIndex]) {
        return nextCellIndex;
      }

      row += rowOffset;
      column += columnOffset;
    }

    return null;
  }

  function handleCellKeyDown(event, cellIndex) {
    const movements = {
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
    };
    const movement = movements[event.key];

    if (movement) {
      event.preventDefault();
      const nextCellIndex = findCellInDirection(cellIndex, movement[0], movement[1]);

      if (nextCellIndex !== null) {
        chooseEntryForCell(nextCellIndex);
        focusCell(nextCellIndex);
      }

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      const entries = getEntriesForCell(level, cellIndex);

      if (entries.length > 1) {
        event.preventDefault();
        chooseEntryForCell(cellIndex, true);
      }

      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      const entry =
        level.entries.find(
          (candidate) => candidate.id === activeEntryId && candidate.path.includes(cellIndex),
        ) ?? getEntriesForCell(level, cellIndex)[0];
      const position = entry?.path.indexOf(cellIndex) ?? -1;
      const previousCellIndex = entry?.path[Math.max(position - 1, 0)];

      setValues((currentValues) => ({
        ...currentValues,
        [cellIndex]: "",
        ...(values[cellIndex] ? {} : { [previousCellIndex]: "" }),
      }));
      setCheckedResult(null);

      if (!values[cellIndex] && previousCellIndex !== undefined) {
        focusCell(previousCellIndex);
      }
    }
  }

  function handleCheck() {
    const result = checkCrossword(level, values);
    setCheckedResult(result);

    if (result.complete) {
      if (levelNumber === MAX_CROSSWORD_LEVEL) {
        setStatus("finished");
        setMessage("¡Completaste el último crucigrama!");
      } else {
        saveLevel(levelNumber + 1);
        setStatus("complete");
        setMessage("¡Nivel completado!");
      }

      return;
    }

    if (result.incorrectCellIndices.length) {
      setMessage(
        `Hay ${result.incorrectCellIndices.length} ${
          result.incorrectCellIndices.length === 1 ? "casilla" : "casillas"
        } para revisar.`,
      );
      return;
    }

    const remainingCellCount = level.activeCellCount - filledCellCount;
    setMessage(
      `Todavía ${remainingCellCount === 1 ? "queda" : "quedan"} ${remainingCellCount} ${
        remainingCellCount === 1 ? "casilla" : "casillas"
      } por completar.`,
    );
  }

  function handleNextLevel() {
    const nextLevelNumber = Math.min(levelNumber + 1, MAX_CROSSWORD_LEVEL);
    saveLevel(nextLevelNumber);
    startLevel(nextLevelNumber);
  }

  function handleResetProgress() {
    saveLevel(1);
    startLevel(1);
  }

  const horizontalEntries = level.entries.filter((entry) => entry.direction === "across");
  const verticalEntries = level.entries.filter((entry) => entry.direction === "down");

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-2xl bg-[#f8fbfd] p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--care-teal)]">
            Nivel {levelNumber} de {MAX_CROSSWORD_LEVEL}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{level.title}</h2>
          <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-[color:var(--care-ink-soft)]">
            <span>
              {liveResult.correctEntryIds.length} de {level.entries.length} palabras
            </span>
            <div
              aria-label={`${liveResult.correctEntryIds.length} de ${level.entries.length} palabras correctas`}
              aria-valuemax={level.entries.length}
              aria-valuemin={0}
              aria-valuenow={liveResult.correctEntryIds.length}
              className="flex flex-1 gap-1.5"
              role="progressbar"
            >
              {level.entries.map((entry, index) => (
                <span
                  aria-hidden="true"
                  className={`h-2 flex-1 rounded-full ${
                    index < liveResult.correctEntryIds.length
                      ? "bg-[color:var(--care-teal)]"
                      : "bg-[color:var(--care-cloud)]"
                  }`}
                  key={entry.id}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          className="min-h-10 rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => startLevel(levelNumber)}
          type="button"
        >
          Reiniciar nivel
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,560px)_minmax(240px,1fr)] lg:items-start">
        <div className="w-full max-w-[560px]">
          <div
            aria-label={`Crucigrama de ${level.size} filas por ${level.size} columnas`}
            className={`grid gap-1 rounded-2xl bg-[color:var(--care-cloud)] p-2 sm:gap-1.5 sm:p-3 ${GRID_COLUMN_CLASSES[level.size]}`}
            role="group"
          >
            {level.grid.map((cell, cellIndex) => {
              if (!cell) {
                return (
                  <span
                    aria-hidden="true"
                    className="aspect-square rounded-sm bg-[color:var(--care-ink-soft)]"
                    key={cellIndex}
                  />
                );
              }

              const isActiveWord = activePath.has(cellIndex);
              const isActiveCell = activeCellIndex === cellIndex;
              const isIncorrect = incorrectCells.has(cellIndex);
              const row = cell.row + 1;
              const column = cell.column + 1;

              return (
                <label className="relative aspect-square min-w-0" key={cellIndex}>
                  {cell.number ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1 top-0.5 z-10 text-[8px] font-bold leading-none text-[color:var(--care-ink-soft)] sm:text-[10px]"
                    >
                      {cell.number}
                    </span>
                  ) : null}
                  <span className="sr-only">
                    Fila {row}, columna {column}
                    {cell.number ? `, inicio de pista ${cell.number}` : ""}
                  </span>
                  <input
                    aria-invalid={isIncorrect || undefined}
                    autoCapitalize="characters"
                    autoComplete="off"
                    className={`h-full w-full rounded-sm border text-center text-sm font-bold uppercase caret-[color:var(--care-teal)] transition focus:relative focus:z-10 focus:outline-none sm:text-lg ${
                      isIncorrect
                        ? "border-[color:var(--care-danger)] bg-white ring-2 ring-inset ring-[color:var(--care-danger)]"
                        : isActiveCell
                          ? "border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)] ring-2 ring-inset ring-[color:var(--care-teal)]"
                          : isActiveWord
                            ? "border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)]"
                            : "border-white bg-white hover:border-[color:var(--care-teal)]"
                    } disabled:cursor-default disabled:opacity-100`}
                    disabled={status !== "playing"}
                    inputMode="text"
                    maxLength={1}
                    onChange={(event) => handleCellChange(cellIndex, event.target.value)}
                    onClick={() => chooseEntryForCell(cellIndex, true)}
                    onFocus={(event) => handleCellFocus(event, cellIndex)}
                    onKeyDown={(event) => handleCellKeyDown(event, cellIndex)}
                    ref={(element) => {
                      if (element) {
                        cellRefs.current.set(cellIndex, element);
                      } else {
                        cellRefs.current.delete(cellIndex);
                      }
                    }}
                    spellCheck={false}
                    type="text"
                    value={values[cellIndex] ?? ""}
                  />
                </label>
              );
            })}
          </div>

          <p
            aria-live="polite"
            className="mt-3 min-h-6 text-center text-sm font-semibold text-[color:var(--care-ink-soft)]"
            role="status"
          >
            {message}
          </p>
        </div>

        <aside className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4">
          {[
            ["Horizontales", horizontalEntries],
            ["Verticales", verticalEntries],
          ].map(([heading, entries]) => (
            <section className="not-first:mt-5" key={heading}>
              <h3 className="font-semibold">{heading}</h3>
              <ul className="mt-2 grid gap-2">
                {entries.map((entry) => {
                  const isSelected = activeEntryId === entry.id;
                  const isCorrect = correctEntries.has(entry.id);

                  return (
                    <li key={entry.id}>
                      <button
                        aria-pressed={isSelected}
                        className={`flex min-h-10 w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          isSelected
                            ? "border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)]"
                            : "border-[color:var(--care-cloud)] bg-white hover:border-[color:var(--care-teal)]"
                        }`}
                        onClick={() => selectEntry(entry)}
                        type="button"
                      >
                        <Badge tone={isCorrect ? "success" : "neutral"}>
                          {entry.number}
                        </Badge>
                        <span>
                          {entry.clue}
                          {isCorrect ? <span className="sr-only">, correcta</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <PrimaryButton
            className="mt-5 w-full"
            disabled={status !== "playing"}
            onClick={handleCheck}
            type="button"
          >
            Comprobar respuestas
          </PrimaryButton>
        </aside>
      </div>

      {status === "complete" ? (
        <div
          className="rounded-2xl border border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)] p-5 text-center"
          role="status"
        >
          <h2 className="text-xl font-semibold">¡Nivel completado!</h2>
          <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
            El próximo crucigrama suma palabras y cruces de manera gradual.
          </p>
          <PrimaryButton className="mt-4" onClick={handleNextLevel} type="button">
            Jugar nivel {levelNumber + 1}
          </PrimaryButton>
        </div>
      ) : null}

      {status === "finished" ? (
        <div
          className="rounded-2xl border border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)] p-5 text-center"
          role="status"
        >
          <h2 className="text-xl font-semibold">¡Completaste todos los crucigramas!</h2>
          <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
            Resolviste cada pista del recorrido Cuida.
          </p>
          <PrimaryButton className="mt-4" onClick={handleResetProgress} type="button">
            Volver al nivel 1
          </PrimaryButton>
        </div>
      ) : null}

      {levelNumber > 1 && status !== "finished" ? (
        <button
          className="mx-auto text-sm font-semibold text-[color:var(--care-ink-soft)] underline decoration-[color:var(--care-cloud)] underline-offset-4 transition hover:text-[color:var(--care-ink)] hover:decoration-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          onClick={handleResetProgress}
          type="button"
        >
          Reiniciar todo el progreso
        </button>
      ) : null}
    </div>
  );
}
