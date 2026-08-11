import assert from "node:assert/strict";
import test from "node:test";
import { removeAnamnesisContent } from "./anamnesis-cleanup.js";

function createDatabase({ documents = [], roots = [] } = {}) {
  const folders = [
    ...roots,
    { id: "anamnesis-child", parentId: "anamnesis", careCircleId: "circle" },
    { id: "other", parentId: null, careCircleId: "circle" },
  ];
  const deletedFolderIds = [];

  return {
    deletedFolderIds,
    document: {
      async findMany() {
        return documents;
      },
    },
    documentFolder: {
      async delete({ where }) {
        deletedFolderIds.push(where.id);
      },
      async findMany({ where }) {
        if (where.systemKey) return roots;
        return folders.filter((folder) => folder.careCircleId === where.careCircleId);
      },
    },
  };
}

test("elimina archivos y la jerarquía completa de Anamnesis", async () => {
  const database = createDatabase({
    documents: [
      { filePath: "documents/circle/evaluacion.pdf" },
      { filePath: "documents/circle/estudio.pdf" },
    ],
    roots: [{ id: "anamnesis", parentId: null, careCircleId: "circle" }],
  });
  const deletedFilePaths = [];

  const totals = await removeAnamnesisContent({
    database,
    async deleteDocumentObjects(filePaths) {
      deletedFilePaths.push(...filePaths);
    },
  });

  assert.deepEqual(deletedFilePaths, [
    "documents/circle/evaluacion.pdf",
    "documents/circle/estudio.pdf",
  ]);
  assert.deepEqual(database.deletedFolderIds, ["anamnesis"]);
  assert.deepEqual(totals, { documents: 2, folders: 2, roots: 1 });
});

test("no elimina nada cuando ya no existe Anamnesis", async () => {
  const database = createDatabase();
  let deletedObjects = false;

  const totals = await removeAnamnesisContent({
    database,
    async deleteDocumentObjects() {
      deletedObjects = true;
    },
  });

  assert.equal(deletedObjects, false);
  assert.deepEqual(database.deletedFolderIds, []);
  assert.deepEqual(totals, { documents: 0, folders: 0, roots: 0 });
});

test("detiene la limpieza si un archivo no pertenece al círculo", async () => {
  const database = createDatabase({
    documents: [{ filePath: "documents/another-circle/evaluacion.pdf" }],
    roots: [{ id: "anamnesis", parentId: null, careCircleId: "circle" }],
  });
  let deletedObjects = false;

  await assert.rejects(
    removeAnamnesisContent({
      database,
      async deleteDocumentObjects() {
        deletedObjects = true;
      },
    }),
    /validar uno de los archivos/,
  );

  assert.equal(deletedObjects, false);
  assert.deepEqual(database.deletedFolderIds, []);
});
