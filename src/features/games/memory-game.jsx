"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GameCompletionModal } from "@/components/game-completion-modal";
import {
  createMemoryDeck,
  getPairCountForLevel,
  MAX_MEMORY_LEVEL,
} from "@/utils/memory-game";

const STORAGE_KEY = "cuida-memory-game-progress-v1";
const COMPARISON_DELAY = 650;
const INITIAL_DECK = createMemoryDeck(1, () => 0.5);

function readSavedLevel() {
  try {
    const savedLevel = Number.parseInt(window.localStorage.getItem(STORAGE_KEY), 10);

    if (Number.isInteger(savedLevel)) {
      return Math.min(Math.max(savedLevel, 1), MAX_MEMORY_LEVEL);
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

export function MemoryGame() {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState(INITIAL_DECK);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState("playing");
  const comparisonTimeoutRef = useRef(null);
  const pairCount = getPairCountForLevel(level);

  function clearPendingComparison() {
    if (comparisonTimeoutRef.current) {
      window.clearTimeout(comparisonTimeoutRef.current);
      comparisonTimeoutRef.current = null;
    }
  }

  function startLevel(nextLevel) {
    clearPendingComparison();
    setLevel(nextLevel);
    setCards(createMemoryDeck(nextLevel));
    setSelectedCardIds([]);
    setMatchedPairIds([]);
    setMoves(0);
    setIsChecking(false);
    setStatus("playing");
  }

  useEffect(() => {
    startLevel(readSavedLevel());

    return clearPendingComparison;
  }, []);

  function handleCardSelection(card) {
    const isAlreadySelected = selectedCardIds.includes(card.cardId);
    const isAlreadyMatched = matchedPairIds.includes(card.id);

    if (isChecking || isAlreadySelected || isAlreadyMatched || status !== "playing") {
      return;
    }

    if (selectedCardIds.length === 0) {
      setSelectedCardIds([card.cardId]);
      return;
    }

    const firstCard = cards.find(({ cardId }) => cardId === selectedCardIds[0]);
    const isMatch = firstCard?.id === card.id;

    setSelectedCardIds([selectedCardIds[0], card.cardId]);
    setMoves((currentMoves) => currentMoves + 1);
    setIsChecking(true);

    comparisonTimeoutRef.current = window.setTimeout(() => {
      if (isMatch) {
        setMatchedPairIds((currentMatches) => {
          const nextMatches = [...currentMatches, card.id];

          if (nextMatches.length === pairCount) {
            if (level === MAX_MEMORY_LEVEL) {
              setStatus("finished");
            } else {
              saveLevel(level + 1);
              setStatus("complete");
            }
          }

          return nextMatches;
        });
      }

      setSelectedCardIds([]);
      setIsChecking(false);
      comparisonTimeoutRef.current = null;
    }, COMPARISON_DELAY);
  }

  function handleNextLevel() {
    const nextLevel = Math.min(level + 1, MAX_MEMORY_LEVEL);
    saveLevel(nextLevel);
    startLevel(nextLevel);
  }

  function handleRestartLevel() {
    startLevel(level);
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
            Nivel {level} de {MAX_MEMORY_LEVEL}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-[color:var(--care-ink-soft)]">
            <span>{moves} {moves === 1 ? "movimiento" : "movimientos"}</span>
            <span>
              {matchedPairIds.length} de {pairCount} pares
            </span>
          </div>
          <div
            aria-label={`${matchedPairIds.length} de ${pairCount} pares encontrados`}
            className="mt-3 flex flex-wrap gap-2"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={pairCount}
            aria-valuenow={matchedPairIds.length}
          >
            {Array.from({ length: pairCount }, (_, index) => (
              <span
                aria-hidden="true"
                className={`h-2.5 flex-1 rounded-full transition-colors ${
                  index < matchedPairIds.length
                    ? "bg-[color:var(--care-teal)]"
                    : "bg-[color:var(--care-cloud)]"
                }`}
                key={index}
              />
            ))}
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

      <div className="mx-auto grid w-full max-w-[22rem] grid-cols-[repeat(auto-fit,minmax(0,4rem))] justify-center gap-2 sm:max-w-[25.5rem] sm:grid-cols-[repeat(auto-fit,minmax(0,4.5rem))] sm:gap-3">
        {cards.map((card, index) => {
          const isMatched = matchedPairIds.includes(card.id);
          const isSelected = selectedCardIds.includes(card.cardId);
          const isRevealed = isMatched || isSelected;

          return (
            <button
              aria-label={
                isRevealed
                  ? `Carta ${card.label}${isMatched ? ", par encontrado" : ""}`
                  : `Dar vuelta la carta ${index + 1}`
              }
              aria-pressed={isRevealed}
              className={`group relative aspect-[4/5] w-16 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--care-teal)] sm:w-18 ${
                isMatched ? "ring-2 ring-[color:var(--care-teal)] ring-offset-2" : ""
              }`}
              disabled={isChecking || isMatched || status !== "playing"}
              key={card.cardId}
              onClick={() => handleCardSelection(card)}
              type="button"
            >
              <span
                className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
                  isRevealed ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[color:var(--care-cloud)] bg-[color:var(--care-teal-soft)] shadow-[0_10px_30px_rgba(11,31,58,0.08)] [backface-visibility:hidden] group-enabled:hover:border-[color:var(--care-teal)]">
                  <Image
                    alt=""
                    className="h-auto w-10 sm:w-12"
                    height={64}
                    src="/cuida-icon-192.png"
                    width={64}
                  />
                </span>
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[color:var(--care-cloud)] bg-white text-3xl shadow-[0_10px_30px_rgba(11,31,58,0.08)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-4xl">
                  <span aria-hidden="true">{card.symbol}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {status === "complete" ? (
        <GameCompletionModal
          description="El próximo nivel suma un nuevo par de cartas."
          onPrimaryAction={handleNextLevel}
          onRestart={handleRestartLevel}
          primaryLabel={`Jugar nivel ${level + 1}`}
          title="¡Nivel completado!"
        />
      ) : null}

      {status === "finished" ? (
        <GameCompletionModal
          description="Encontraste todos los pares del desafío de memoria."
          onPrimaryAction={handleResetProgress}
          onRestart={handleRestartLevel}
          primaryLabel="Volver al nivel 1"
          title="¡Completaste todos los niveles!"
        />
      ) : null}

      {level > 1 && status !== "finished" ? (
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
