"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameCompletionModal } from "@/components/game-completion-modal";
import { Badge } from "@/components/ui";
import {
  getCategorySortingLevel,
  isCorrectCategory,
  MAX_CATEGORY_SORTING_LEVEL,
} from "@/utils/category-sorting";

const STORAGE_KEY = "cuida-category-sorting-progress-v1";
const CATEGORY_GRID_CLASSES = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
};

function readSavedLevel() {
  try {
    const savedLevel = Number.parseInt(window.localStorage.getItem(STORAGE_KEY), 10);

    if (Number.isInteger(savedLevel)) {
      return Math.min(Math.max(savedLevel, 1), MAX_CATEGORY_SORTING_LEVEL);
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

export function CategorySortingGame() {
  const [levelNumber, setLevelNumber] = useState(1);
  const [sortedWordIds, setSortedWordIds] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [draggedWordId, setDraggedWordId] = useState(null);
  const [dropCategoryId, setDropCategoryId] = useState(null);
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState(
    "Arrastrá una palabra o elegila y después tocá su categoría.",
  );
  const dragStateRef = useRef(null);
  const nativeDraggedWordIdRef = useRef(null);
  const suppressClickUntilRef = useRef(0);
  const level = useMemo(
    () => getCategorySortingLevel(levelNumber),
    [levelNumber],
  );
  const sortedWordIdSet = useMemo(
    () => new Set(sortedWordIds),
    [sortedWordIds],
  );
  const wordsById = useMemo(
    () => new Map(level.words.map((word) => [word.id, word])),
    [level.words],
  );
  const remainingWords = level.words.filter(
    (word) => !sortedWordIdSet.has(word.id),
  );
  const activeWordId = draggedWordId ?? selectedWordId;

  function startLevel(nextLevelNumber) {
    setLevelNumber(nextLevelNumber);
    setSortedWordIds([]);
    setSelectedWordId(null);
    setDraggedWordId(null);
    setDropCategoryId(null);
    setStatus("playing");
    setMessage("Arrastrá una palabra o elegila y después tocá su categoría.");
    dragStateRef.current = null;
  }

  useEffect(() => {
    startLevel(readSavedLevel());
  }, []);

  function finishLevel() {
    if (levelNumber === MAX_CATEGORY_SORTING_LEVEL) {
      setStatus("finished");
      setMessage("¡Clasificaste todas las palabras del recorrido!");
      return;
    }

    saveLevel(levelNumber + 1);
    setStatus("complete");
    setMessage("¡Nivel completado!");
  }

  function attemptPlacement(wordId, categoryId) {
    if (status !== "playing" || sortedWordIdSet.has(wordId)) {
      return;
    }

    const word = wordsById.get(wordId);
    const category = level.categories.find(
      (candidate) => candidate.id === categoryId,
    );

    setSelectedWordId(null);
    setDraggedWordId(null);
    setDropCategoryId(null);

    if (!word || !category) {
      setMessage("No pudimos ubicar esa palabra. Probá nuevamente.");
      return;
    }

    if (!isCorrectCategory(level, wordId, categoryId)) {
      setMessage(
        `${word.text} no pertenece a ${category.name}. Probá con otra categoría.`,
      );
      return;
    }

    const nextWordIds = [...sortedWordIds, wordId];
    setSortedWordIds(nextWordIds);

    if (nextWordIds.length === level.words.length) {
      finishLevel();
    } else {
      setMessage(`${word.text} pertenece a ${category.name}.`);
    }
  }

  function handleWordClick(wordId) {
    if (Date.now() < suppressClickUntilRef.current || status !== "playing") {
      return;
    }

    setSelectedWordId((currentWordId) => {
      const nextWordId = currentWordId === wordId ? null : wordId;
      const word = wordsById.get(wordId);

      setMessage(
        nextWordId
          ? `${word.text} está seleccionada. Elegí una categoría.`
          : "Selección cancelada. Elegí otra palabra cuando quieras.",
      );
      return nextWordId;
    });
  }

  function handleWordPointerDown(event, wordId) {
    if (status !== "playing" || event.pointerType === "mouse") {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      wordId,
    };
  }

  function handleWordPointerMove(event) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.hypot(
      event.clientX - dragState.startX,
      event.clientY - dragState.startY,
    );

    if (!dragState.moved && distance < 8) {
      return;
    }

    event.preventDefault();
    dragState.moved = true;
    setDraggedWordId(dragState.wordId);
    setSelectedWordId(null);
    const categoryElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-category-id]");
    setDropCategoryId(categoryElement?.dataset.categoryId ?? null);
  }

  function handleWordPointerUp(event) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!dragState.moved) {
      return;
    }

    suppressClickUntilRef.current = Date.now() + 300;
    const categoryElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-category-id]");
    const categoryId = categoryElement?.dataset.categoryId;

    if (categoryId) {
      attemptPlacement(dragState.wordId, categoryId);
    } else {
      setDraggedWordId(null);
      setDropCategoryId(null);
      setMessage("Soltá la palabra dentro de una categoría para ubicarla.");
    }
  }

  function handleWordPointerCancel() {
    dragStateRef.current = null;
    setDraggedWordId(null);
    setDropCategoryId(null);
    setMessage("El arrastre se canceló. La palabra sigue disponible.");
  }

  function handleWordDragStart(event, wordId) {
    if (status !== "playing") {
      event.preventDefault();
      return;
    }

    nativeDraggedWordIdRef.current = wordId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", wordId);
    setSelectedWordId(null);
    setDraggedWordId(wordId);
    setMessage("Llevá la palabra hasta la categoría que le corresponde.");
  }

  function handleWordDragEnd() {
    nativeDraggedWordIdRef.current = null;
    setDraggedWordId(null);
    setDropCategoryId(null);
  }

  function handleCategoryDragOver(event, categoryId) {
    if (status !== "playing" || !nativeDraggedWordIdRef.current) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropCategoryId(categoryId);
  }

  function handleCategoryDrop(event, categoryId) {
    event.preventDefault();
    const wordId =
      event.dataTransfer.getData("text/plain") || nativeDraggedWordIdRef.current;

    nativeDraggedWordIdRef.current = null;

    if (wordId) {
      attemptPlacement(wordId, categoryId);
    }
  }

  function handleCategoryClick(categoryId) {
    if (status !== "playing") {
      return;
    }

    if (!selectedWordId) {
      setMessage("Primero elegí una palabra del banco.");
      return;
    }

    attemptPlacement(selectedWordId, categoryId);
  }

  function handleWordKeyDown(event, wordId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleWordClick(wordId);
    }
  }

  function handleCategoryKeyDown(event, categoryId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCategoryClick(categoryId);
    }
  }

  function handleNextLevel() {
    const nextLevelNumber = Math.min(
      levelNumber + 1,
      MAX_CATEGORY_SORTING_LEVEL,
    );
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
      <div className="grid gap-4 rounded-2xl bg-[color:var(--care-canvas)] p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--care-teal)]">
            Nivel {levelNumber} de {MAX_CATEGORY_SORTING_LEVEL}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{level.title}</h2>
          <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-[color:var(--care-ink-soft)]">
            <span>
              {sortedWordIds.length} de {level.words.length} palabras
            </span>
            <div
              aria-label={`${sortedWordIds.length} de ${level.words.length} palabras clasificadas`}
              aria-valuemax={level.words.length}
              aria-valuemin={0}
              aria-valuenow={sortedWordIds.length}
              className="flex flex-1 gap-1"
              role="progressbar"
            >
              {level.words.map((word, index) => (
                <span
                  aria-hidden="true"
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                    index < sortedWordIds.length
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
          className="min-h-10 rounded-full border border-[color:var(--care-cloud)] bg-[color:var(--care-paper)] px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={handleRestartLevel}
          type="button"
        >
          Reiniciar nivel
        </button>
      </div>

      <section aria-labelledby="category-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[color:var(--care-teal)]">
              Destinos
            </p>
            <h3 className="mt-1 text-xl font-semibold" id="category-heading">
              Categorías
            </h3>
          </div>
          <p className="text-sm text-[color:var(--care-muted)]">
            {level.categories.length} categorías en este nivel
          </p>
        </div>

        <div
          className={`mt-4 grid gap-3 ${CATEGORY_GRID_CLASSES[level.categories.length]}`}
        >
          {level.categories.map((category) => {
            const categoryWords = level.words.filter(
              (word) =>
                word.categoryId === category.id && sortedWordIdSet.has(word.id),
            );
            const isDropTarget = dropCategoryId === category.id;
            const canReceiveSelection = Boolean(selectedWordId);

            return (
              <button
                aria-label={`${category.name}: ${categoryWords.length} de ${category.wordCount} palabras clasificadas`}
                className={`min-h-36 rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                  isDropTarget
                    ? "border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)] shadow-sm ring-2 ring-[color:var(--care-teal)]"
                    : canReceiveSelection
                      ? "border-[color:var(--care-teal)] bg-[color:var(--care-paper)] hover:bg-[color:var(--care-teal-soft)]"
                      : "border-[color:var(--care-cloud)] bg-[color:var(--care-paper)] hover:border-[color:var(--care-teal)]"
                } disabled:cursor-default disabled:opacity-100`}
                data-category-id={category.id}
                disabled={status !== "playing"}
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                onDragOver={(event) => handleCategoryDragOver(event, category.id)}
                onDrop={(event) => handleCategoryDrop(event, category.id)}
                onKeyDown={(event) => handleCategoryKeyDown(event, category.id)}
                type="button"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{category.name}</span>
                  <Badge tone={categoryWords.length ? "success" : "neutral"}>
                    {categoryWords.length}/{category.wordCount}
                  </Badge>
                </span>
                <span className="mt-4 flex flex-wrap gap-2">
                  {categoryWords.length ? (
                    categoryWords.map((word) => (
                      <span
                        className="rounded-full bg-[color:var(--care-teal-soft)] px-3 py-1.5 text-sm font-semibold text-[color:var(--care-ink)]"
                        key={word.id}
                      >
                        {word.text}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[color:var(--care-muted)]">
                      Todavía no hay palabras aquí.
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="word-bank-heading"
        className="rounded-2xl border border-[color:var(--care-cloud)] bg-[color:var(--care-canvas)] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[color:var(--care-teal)]">
              Fichas disponibles
            </p>
            <h3 className="mt-1 text-xl font-semibold" id="word-bank-heading">
              Banco de palabras
            </h3>
          </div>
          <p className="text-sm text-[color:var(--care-muted)]">
            {remainingWords.length} por clasificar
          </p>
        </div>

        <div className="mt-4 flex min-h-20 flex-wrap content-start gap-2">
          {remainingWords.length ? (
            remainingWords.map((word) => {
              const isActive = activeWordId === word.id;

              return (
                <button
                  aria-pressed={selectedWordId === word.id}
                  className={`min-h-11 touch-none select-none rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none sm:text-base ${
                    isActive
                      ? "scale-[1.03] border-[color:var(--care-teal)] bg-[color:var(--care-teal-soft)] shadow-sm"
                      : "border-[color:var(--care-cloud)] bg-[color:var(--care-paper)] hover:border-[color:var(--care-teal)] hover:bg-[color:var(--care-teal-soft)]"
                  } disabled:cursor-default disabled:opacity-100`}
                  disabled={status !== "playing"}
                  draggable={status === "playing"}
                  key={word.id}
                  onClick={() => handleWordClick(word.id)}
                  onDragEnd={handleWordDragEnd}
                  onDragStart={(event) => handleWordDragStart(event, word.id)}
                  onPointerCancel={handleWordPointerCancel}
                  onPointerDown={(event) => handleWordPointerDown(event, word.id)}
                  onPointerMove={handleWordPointerMove}
                  onPointerUp={handleWordPointerUp}
                  onKeyDown={(event) => handleWordKeyDown(event, word.id)}
                  type="button"
                >
                  {word.text}
                </button>
              );
            })
          ) : (
            <p className="text-sm font-semibold text-[color:var(--care-success)]">
              Todas las palabras encontraron su lugar.
            </p>
          )}
        </div>
      </section>

      <p
        aria-live="polite"
        className="min-h-6 text-center text-sm font-semibold text-[color:var(--care-ink-soft)]"
        role="status"
      >
        {message}
      </p>

      {status === "complete" ? (
        <GameCompletionModal
          description="El próximo nivel suma palabras y categorías de manera gradual."
          onPrimaryAction={handleNextLevel}
          onRestart={handleRestartLevel}
          primaryLabel={`Jugar nivel ${levelNumber + 1}`}
          title="¡Nivel completado!"
        />
      ) : null}

      {status === "finished" ? (
        <GameCompletionModal
          description="Cada palabra encontró su lugar en el recorrido Cuida."
          onPrimaryAction={handleResetProgress}
          onRestart={handleRestartLevel}
          primaryLabel="Volver al nivel 1"
          title="¡Completaste todas las categorías!"
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
