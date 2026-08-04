"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameCompletionModal } from "@/components/game-completion-modal";
import { Badge } from "@/components/ui";
import {
  findWordForSelection,
  getLineIndices,
  getWordSearchLevel,
  MAX_WORD_SEARCH_LEVEL,
} from "@/utils/word-search";

const STORAGE_KEY = "cuida-word-search-progress-v1";
const INITIAL_LEVEL = getWordSearchLevel(1);
const GRID_COLUMN_CLASSES = {
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
};

function readSavedLevel() {
  try {
    const savedLevel = Number.parseInt(window.localStorage.getItem(STORAGE_KEY), 10);

    if (Number.isInteger(savedLevel)) {
      return Math.min(Math.max(savedLevel, 1), MAX_WORD_SEARCH_LEVEL);
    }
  } catch {
    return 1;
  }

  return 1;
}

function saveLevel(level) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(level));
  } catch {
    // El juego continúa aunque el navegador no permita almacenamiento local.
  }
}

export function WordSearchGame() {
  const [levelNumber, setLevelNumber] = useState(1);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [foundWordIds, setFoundWordIds] = useState([]);
  const [selectionPath, setSelectionPath] = useState([]);
  const [focusedCellIndex, setFocusedCellIndex] = useState(0);
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("Elegí la primera y la última letra de una palabra.");
  const gridRef = useRef(null);
  const tapStartIndexRef = useRef(null);
  const pointerSelectionRef = useRef({ startIndex: null, endIndex: null, moved: false });

  const selectedCellIndices = useMemo(() => new Set(selectionPath), [selectionPath]);
  const foundCellIndices = useMemo(() => {
    const foundIds = new Set(foundWordIds);
    return new Set(
      level.words
        .filter((word) => foundIds.has(word.id))
        .flatMap((word) => word.path),
    );
  }, [foundWordIds, level.words]);

  function startLevel(nextLevelNumber) {
    const nextLevel = getWordSearchLevel(nextLevelNumber);
    setLevelNumber(nextLevelNumber);
    setLevel(nextLevel);
    setFoundWordIds([]);
    setSelectionPath([]);
    setFocusedCellIndex(0);
    setStatus("playing");
    setMessage("Elegí la primera y la última letra de una palabra.");
    tapStartIndexRef.current = null;
    pointerSelectionRef.current = { startIndex: null, endIndex: null, moved: false };
  }

  useEffect(() => {
    startLevel(readSavedLevel());
  }, []);

  function finishSelection(startIndex, endIndex) {
    const path = getLineIndices(startIndex, endIndex, level.size);

    if (path.length < 2) {
      setSelectionPath([]);
      setMessage("Seleccioná al menos dos letras en línea recta.");
      return;
    }

    const word = findWordForSelection(level, startIndex, endIndex);

    if (!word) {
      setSelectionPath([]);
      setMessage("Esa selección no corresponde a una palabra de la lista.");
      return;
    }

    if (foundWordIds.includes(word.id)) {
      setSelectionPath([]);
      setMessage(`${word.display} ya estaba encontrada.`);
      return;
    }

    setFoundWordIds((currentFoundWordIds) => {
      const nextFoundWordIds = [...currentFoundWordIds, word.id];

      if (nextFoundWordIds.length === level.words.length) {
        if (levelNumber === MAX_WORD_SEARCH_LEVEL) {
          setStatus("finished");
          setMessage("¡Encontraste todas las palabras del último nivel!");
        } else {
          saveLevel(levelNumber + 1);
          setStatus("complete");
          setMessage("¡Nivel completado!");
        }
      } else {
        setMessage(`Encontraste ${word.display}.`);
      }

      return nextFoundWordIds;
    });
    setSelectionPath([]);
  }

  function handleTapSelection(cellIndex) {
    if (status !== "playing") {
      return;
    }

    if (tapStartIndexRef.current === null) {
      tapStartIndexRef.current = cellIndex;
      setSelectionPath([cellIndex]);
      setMessage("Ahora elegí la última letra de la palabra.");
      return;
    }

    const startIndex = tapStartIndexRef.current;
    tapStartIndexRef.current = null;
    finishSelection(startIndex, cellIndex);
  }

  function handlePointerDown(event) {
    if (status !== "playing") {
      return;
    }

    const cell = event.target.closest("button[data-cell-index]");

    if (!cell) {
      return;
    }

    event.preventDefault();
    gridRef.current?.setPointerCapture(event.pointerId);
    const cellIndex = Number.parseInt(cell.dataset.cellIndex, 10);
    pointerSelectionRef.current = {
      startIndex: cellIndex,
      endIndex: cellIndex,
      moved: false,
    };
    setSelectionPath([cellIndex]);
  }

  function handlePointerMove(event) {
    const pointerSelection = pointerSelectionRef.current;

    if (pointerSelection.startIndex === null) {
      return;
    }

    const cell = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("button[data-cell-index]");

    if (!cell || !gridRef.current?.contains(cell)) {
      return;
    }

    const cellIndex = Number.parseInt(cell.dataset.cellIndex, 10);

    if (cellIndex === pointerSelection.endIndex) {
      return;
    }

    pointerSelection.endIndex = cellIndex;
    pointerSelection.moved = true;
    const path = getLineIndices(pointerSelection.startIndex, cellIndex, level.size);
    setSelectionPath(path.length ? path : [pointerSelection.startIndex]);
  }

  function handlePointerUp(event) {
    const pointerSelection = pointerSelectionRef.current;

    if (pointerSelection.startIndex === null) {
      return;
    }

    event.preventDefault();
    const { startIndex, endIndex, moved } = pointerSelection;
    pointerSelectionRef.current = { startIndex: null, endIndex: null, moved: false };

    if (moved) {
      tapStartIndexRef.current = null;
      finishSelection(startIndex, endIndex);
    } else {
      handleTapSelection(endIndex);
    }
  }

  function handlePointerCancel() {
    pointerSelectionRef.current = { startIndex: null, endIndex: null, moved: false };
    setSelectionPath(tapStartIndexRef.current === null ? [] : [tapStartIndexRef.current]);
  }

  function handleCellKeyDown(event, cellIndex) {
    const row = Math.floor(cellIndex / level.size);
    const column = cellIndex % level.size;
    const movements = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const movement = movements[event.key];

    if (movement) {
      event.preventDefault();
      const nextRow = row + movement[0];
      const nextColumn = column + movement[1];

      if (
        nextRow >= 0 &&
        nextRow < level.size &&
        nextColumn >= 0 &&
        nextColumn < level.size
      ) {
        const nextCellIndex = nextRow * level.size + nextColumn;
        setFocusedCellIndex(nextCellIndex);
        gridRef.current
          ?.querySelector(`button[data-cell-index="${nextCellIndex}"]`)
          ?.focus();
      }

      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTapSelection(cellIndex);
    }
  }

  function handleNextLevel() {
    const nextLevelNumber = Math.min(levelNumber + 1, MAX_WORD_SEARCH_LEVEL);
    saveLevel(nextLevelNumber);
    startLevel(nextLevelNumber);
  }

  function handleRestartLevel() {
    startLevel(levelNumber);
  }

  function handleResetProgress() {
    saveLevel(1);
    startLevel(1);
  }

  return (
    <div className="relative grid gap-6">
      <div className="grid gap-4 rounded-2xl bg-[#f8fbfd] p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--care-teal)]">
            Nivel {levelNumber} de {MAX_WORD_SEARCH_LEVEL}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{level.title}</h2>
          <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-[color:var(--care-ink-soft)]">
            <span>
              {foundWordIds.length} de {level.words.length} palabras
            </span>
            <div
              aria-label={`${foundWordIds.length} de ${level.words.length} palabras encontradas`}
              aria-valuemax={level.words.length}
              aria-valuemin={0}
              aria-valuenow={foundWordIds.length}
              className="flex flex-1 gap-1.5"
              role="progressbar"
            >
              {level.words.map((word, index) => (
                <span
                  aria-hidden="true"
                  className={`h-2 flex-1 rounded-full ${
                    index < foundWordIds.length
                      ? "bg-[color:var(--care-teal)]"
                      : "bg-[color:var(--care-cloud)]"
                  }`}
                  key={word.id}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          className="min-h-10 rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={handleRestartLevel}
          type="button"
        >
          Reiniciar nivel
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,680px)_220px] lg:items-start">
        <div className="w-full max-w-[680px]">
          <div
            aria-label={`Sopa de letras de ${level.size} filas por ${level.size} columnas`}
            className={`grid select-none gap-1 rounded-2xl bg-[color:var(--care-cloud)] p-2 [touch-action:none] sm:gap-2 sm:p-3 ${GRID_COLUMN_CLASSES[level.size]}`}
            onPointerCancel={handlePointerCancel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={gridRef}
          >
            {level.grid.map((letter, cellIndex) => {
              const isFound = foundCellIndices.has(cellIndex);
              const isSelected = selectedCellIndices.has(cellIndex);
              const row = Math.floor(cellIndex / level.size) + 1;
              const column = (cellIndex % level.size) + 1;

              return (
                <button
                  aria-label={`Fila ${row}, columna ${column}, letra ${letter}${
                    isFound ? ", palabra encontrada" : ""
                  }`}
                  aria-pressed={isSelected || isFound}
                  className={`aspect-square min-w-0 rounded-lg text-sm font-semibold transition sm:rounded-xl sm:text-lg ${
                    isFound
                      ? "bg-[color:var(--care-teal)] text-[color:var(--care-ink)] shadow-sm"
                      : isSelected
                        ? "bg-[color:var(--care-teal-soft)] text-[color:var(--care-ink)] ring-2 ring-inset ring-[color:var(--care-teal)]"
                        : "bg-white text-[color:var(--care-ink-soft)] hover:bg-[color:var(--care-teal-soft)]"
                  } focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--care-teal)]`}
                  data-cell-index={cellIndex}
                  key={cellIndex}
                  onFocus={() => setFocusedCellIndex(cellIndex)}
                  onKeyDown={(event) => handleCellKeyDown(event, cellIndex)}
                  tabIndex={focusedCellIndex === cellIndex ? 0 : -1}
                  type="button"
                >
                  {letter}
                </button>
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
          <h3 className="font-semibold">Palabras por encontrar</h3>
          <ul className="mt-3 flex flex-wrap gap-2 lg:grid">
            {level.words.map((word) => {
              const isFound = foundWordIds.includes(word.id);

              return (
                <li key={word.id}>
                  <Badge tone={isFound ? "success" : "neutral"}>
                    <span className={isFound ? "line-through" : ""}>{word.display}</span>
                    {isFound ? <span className="sr-only"> encontrada</span> : null}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      {status === "complete" ? (
        <GameCompletionModal
          description="El próximo tablero suma un desafío nuevo de forma gradual."
          onPrimaryAction={handleNextLevel}
          onRestart={handleRestartLevel}
          primaryLabel={`Jugar nivel ${levelNumber + 1}`}
          title="¡Nivel completado!"
        />
      ) : null}

      {status === "finished" ? (
        <GameCompletionModal
          description="Encontraste cada palabra del recorrido Cuida."
          onPrimaryAction={handleResetProgress}
          onRestart={handleRestartLevel}
          primaryLabel="Volver al nivel 1"
          title="¡Completaste todas las sopas de letras!"
        />
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
