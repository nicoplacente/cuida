export const MAX_CATEGORY_SORTING_LEVEL = 8;

const LEVEL_SPECS = [
  {
    title: "Primeras familias",
    categories: [
      { id: "frutas", name: "Frutas", words: ["Frutilla", "Manzana"] },
      { id: "animales", name: "Animales", words: ["Perro", "Vaca", "Elefante"] },
      { id: "colores", name: "Colores", words: ["Azul", "Rojo", "Violeta"] },
    ],
  },
  {
    title: "Cosas de todos los días",
    categories: [
      { id: "ropa", name: "Ropa", words: ["Camisa", "Pantalón", "Bufanda"] },
      { id: "bebidas", name: "Bebidas", words: ["Agua", "Té", "Leche"] },
      { id: "transportes", name: "Transportes", words: ["Auto", "Tren", "Bicicleta"] },
    ],
  },
  {
    title: "Palabras en movimiento",
    categories: [
      { id: "naturaleza", name: "Naturaleza", words: ["Árbol", "Río", "Nube", "Montaña"] },
      { id: "alimentos", name: "Alimentos", words: ["Pan", "Arroz", "Queso"] },
      { id: "acciones", name: "Acciones", words: ["Caminar", "Leer", "Cantar"] },
    ],
  },
  {
    title: "Cada cosa en su lugar",
    categories: [
      { id: "cocina", name: "Cocina", words: ["Olla", "Plato", "Cuchara"] },
      { id: "dormitorio", name: "Dormitorio", words: ["Almohada", "Sábana", "Placard"] },
      { id: "bano", name: "Baño", words: ["Toalla", "Jabón", "Cepillo"] },
      { id: "jardin", name: "Jardín", words: ["Maceta", "Pala", "Manguera"] },
    ],
  },
  {
    title: "Ideas que se conectan",
    categories: [
      { id: "emociones", name: "Emociones", words: ["Alegría", "Calma", "Sorpresa", "Cariño"] },
      { id: "profesiones", name: "Profesiones", words: ["Docente", "Cocinero", "Carpintera"] },
      { id: "instrumentos", name: "Instrumentos", words: ["Guitarra", "Piano", "Tambor"] },
      { id: "deportes", name: "Deportes", words: ["Fútbol", "Tenis", "Natación", "Ciclismo"] },
    ],
  },
  {
    title: "Ambientes del hogar",
    categories: [
      { id: "objetos-cocina", name: "Objetos de cocina", words: ["Taza", "Sartén", "Tenedor", "Colador"] },
      { id: "objetos-dormitorio", name: "Objetos del dormitorio", words: ["Cama", "Velador", "Manta", "Percha"] },
      { id: "objetos-bano", name: "Objetos del baño", words: ["Espejo", "Peine", "Esponja", "Shampoo"] },
      { id: "objetos-living", name: "Objetos del living", words: ["Sillón", "Mesa ratona", "Televisor", "Biblioteca"] },
    ],
  },
  {
    title: "La mesa y sus grupos",
    categories: [
      { id: "frutas", name: "Frutas", words: ["Banana", "Naranja", "Uva", "Durazno"] },
      { id: "verduras", name: "Verduras", words: ["Zanahoria", "Lechuga", "Zapallo", "Acelga"] },
      { id: "cereales", name: "Cereales", words: ["Avena", "Trigo", "Maíz"] },
      { id: "lacteos", name: "Lácteos", words: ["Yogur", "Queso", "Manteca"] },
      { id: "bebidas", name: "Bebidas", words: ["Agua", "Café", "Jugo"] },
    ],
  },
  {
    title: "El mundo animal",
    categories: [
      { id: "domesticos", name: "Animales domésticos", words: ["Perro", "Gato", "Hámster"] },
      { id: "granja", name: "Animales de granja", words: ["Vaca", "Caballo", "Oveja", "Cerdo"] },
      { id: "salvajes", name: "Animales salvajes", words: ["León", "Tigre", "Elefante", "Jirafa"] },
      { id: "aves", name: "Aves", words: ["Paloma", "Águila", "Gorrión"] },
      { id: "acuaticos", name: "Animales acuáticos", words: ["Delfín", "Tiburón", "Ballena", "Pez"] },
    ],
  },
];

const levelCache = new Map();

function normalizeWord(word) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR");
}

function seededShuffle(items, seed) {
  const shuffledItems = [...items];
  let state = seed;

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const swapIndex = state % (index + 1);
    [shuffledItems[index], shuffledItems[swapIndex]] = [
      shuffledItems[swapIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function buildLevel(spec, levelNumber) {
  if (!spec.categories.length) {
    throw new Error(`El nivel ${levelNumber} no tiene categorías.`);
  }

  const categoryIds = new Set();
  const normalizedWords = new Set();
  const words = [];
  const categories = spec.categories.map((category) => {
    if (!category.id || !category.name || !category.words.length) {
      throw new Error(`El nivel ${levelNumber} contiene una categoría inválida.`);
    }

    if (categoryIds.has(category.id)) {
      throw new Error(`El nivel ${levelNumber} contiene categorías duplicadas.`);
    }

    categoryIds.add(category.id);
    category.words.forEach((word, wordIndex) => {
      const normalizedWord = normalizeWord(word);

      if (!normalizedWord || normalizedWords.has(normalizedWord)) {
        throw new Error(`El nivel ${levelNumber} contiene palabras inválidas o duplicadas.`);
      }

      normalizedWords.add(normalizedWord);
      words.push({
        categoryId: category.id,
        id: `level-${levelNumber}-${category.id}-${wordIndex + 1}`,
        text: word,
      });
    });

    return {
      id: category.id,
      name: category.name,
      wordCount: category.words.length,
    };
  });

  return {
    categories,
    levelNumber,
    title: spec.title,
    words: seededShuffle(words, levelNumber * 7919),
  };
}

export function getCategorySortingLevel(levelNumber) {
  const safeLevelNumber = Math.min(
    Math.max(Number.isInteger(levelNumber) ? levelNumber : 1, 1),
    MAX_CATEGORY_SORTING_LEVEL,
  );

  if (!levelCache.has(safeLevelNumber)) {
    levelCache.set(
      safeLevelNumber,
      buildLevel(LEVEL_SPECS[safeLevelNumber - 1], safeLevelNumber),
    );
  }

  return levelCache.get(safeLevelNumber);
}

export function isCorrectCategory(level, wordId, categoryId) {
  const word = level.words.find((candidate) => candidate.id === wordId);
  return Boolean(word && word.categoryId === categoryId);
}

export function getCategoryForWord(level, wordId) {
  const word = level.words.find((candidate) => candidate.id === wordId);

  if (!word) {
    return null;
  }

  return level.categories.find((category) => category.id === word.categoryId) ?? null;
}
