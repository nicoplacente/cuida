import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteDocumentObjectsWith,
  isCareCircleDocumentKey,
} from "./document-storage-core.js";

test("valida que la clave pertenezca al círculo de cuidado", () => {
  assert.equal(isCareCircleDocumentKey("documents/circle/file.pdf", "circle"), true);
  assert.equal(isCareCircleDocumentKey("documents/another/file.pdf", "circle"), false);
});

test("elimina archivos en lotes de hasta cuatro", async () => {
  const pendingResolvers = [];
  let activeDeletions = 0;
  let maximumConcurrentDeletions = 0;
  const deletion = deleteDocumentObjectsWith(
    ["1", "2", "3", "4", "5"],
    (filePath) =>
      new Promise((resolve) => {
        activeDeletions += 1;
        maximumConcurrentDeletions = Math.max(
          maximumConcurrentDeletions,
          activeDeletions,
        );
        pendingResolvers.push(() => {
          activeDeletions -= 1;
          resolve(filePath);
        });
      }),
  );

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(pendingResolvers.length, 4);
  pendingResolvers.splice(0, 4).forEach((resolve) => resolve());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(pendingResolvers.length, 1);
  pendingResolvers.shift()();
  await deletion;

  assert.equal(maximumConcurrentDeletions, 4);
});
