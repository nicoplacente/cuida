import assert from "node:assert/strict";
import test from "node:test";
import {
  collectDescendantFolderIds,
  getFolderLocationKey,
  getFolderPath,
  getFolderPathLabel,
  matchesDocumentSearch,
  normalizeFolderName,
  validateFolderName,
} from "./folders.js";

const folders = [
  { id: "personal", name: "Personal", parentId: null },
  { id: "dni", name: "DNI", parentId: "personal" },
  { id: "frente", name: "Frente", parentId: "dni" },
  { id: "licencia", name: "Licencia", parentId: "personal" },
];

test("normaliza espacios y genera claves sin distinguir tildes o mayúsculas", () => {
  assert.equal(normalizeFolderName("  Historia   clínica  "), "Historia clínica");
  assert.equal(getFolderLocationKey(null, "Historia clínica"), "root:historia clinica");
  assert.equal(getFolderLocationKey("personal", "  DnÍ "), "personal:dni");
});

test("valida nombres vacíos y demasiado largos", () => {
  assert.match(validateFolderName("   ").error, /nombre/);
  assert.match(validateFolderName("a".repeat(81)).error, /80/);
  assert.deepEqual(validateFolderName("  Estudios cardíacos "), {
    error: null,
    name: "Estudios cardíacos",
  });
});

test("reúne una carpeta y todos sus descendientes sin repetir ciclos", () => {
  assert.deepEqual(
    new Set(collectDescendantFolderIds(folders, "personal")),
    new Set(["personal", "dni", "frente", "licencia"]),
  );

  const cyclicFolders = [
    { id: "a", parentId: "b" },
    { id: "b", parentId: "a" },
  ];
  assert.deepEqual(new Set(collectDescendantFolderIds(cyclicFolders, "a")), new Set(["a", "b"]));
});

test("construye rutas completas desde la raíz", () => {
  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));

  assert.deepEqual(
    getFolderPath(foldersById, "frente").map((folder) => folder.name),
    ["Personal", "DNI", "Frente"],
  );
  assert.equal(getFolderPathLabel(foldersById, "dni"), "Documentos / Personal / DNI");
  assert.equal(getFolderPathLabel(foldersById, null), "Documentos");
});

test("busca documentos ignorando mayúsculas y tildes", () => {
  const document = {
    fileName: "electrocardiograma.pdf",
    notes: "Estudio del corazón",
    title: "Evaluación cardíaca",
  };

  assert.equal(matchesDocumentSearch(document, "CARDIACA"), true);
  assert.equal(matchesDocumentSearch(document, "corazon"), true);
  assert.equal(matchesDocumentSearch(document, "neurología"), false);
});
