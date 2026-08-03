export const MAX_MEMORY_LEVEL = 9;

const memoryPairs = [
  { id: "heart", symbol: "💙", label: "corazón azul" },
  { id: "flower", symbol: "🌻", label: "girasol" },
  { id: "sun", symbol: "☀️", label: "sol" },
  { id: "cup", symbol: "☕", label: "taza" },
  { id: "leaf", symbol: "🌿", label: "hoja" },
  { id: "home", symbol: "🏡", label: "casa" },
  { id: "book", symbol: "📖", label: "libro" },
  { id: "music", symbol: "🎵", label: "nota musical" },
  { id: "moon", symbol: "🌙", label: "luna" },
  { id: "rainbow", symbol: "🌈", label: "arcoíris" },
];

function normalizeLevel(level) {
  if (!Number.isInteger(level)) {
    return 1;
  }

  return Math.min(Math.max(level, 1), MAX_MEMORY_LEVEL);
}

export function getPairCountForLevel(level) {
  return normalizeLevel(level) + 1;
}

export function createMemoryDeck(level, random = Math.random) {
  const pairCount = getPairCountForLevel(level);
  const cards = memoryPairs.slice(0, pairCount).flatMap((pair) => [
    { ...pair, cardId: `${pair.id}-1` },
    { ...pair, cardId: `${pair.id}-2` },
  ]);

  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }

  return cards;
}
