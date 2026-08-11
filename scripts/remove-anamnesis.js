import "./load-environment.js";
import { removeAnamnesisContent } from "../src/features/documents/anamnesis-cleanup.js";
import { prisma } from "../src/services/db.js";
import { deleteDocumentObjectsWith } from "../src/services/document-storage-core.js";
import { deleteR2Object } from "../src/services/r2-client.js";
import { logServerError } from "../src/utils/safe-logger.js";

async function run() {
  try {
    const totals = await removeAnamnesisContent({
      database: prisma,
      deleteDocumentObjects: (filePaths) =>
        deleteDocumentObjectsWith(filePaths, deleteR2Object),
    });

    console.log(
      `Limpieza completada: ${totals.roots} carpetas Anamnesis, ${totals.folders} carpetas totales y ${totals.documents} documentos eliminados.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  logServerError("removeAnamnesis:fatal", error, {
    code: "ANAMNESIS_CLEANUP_FAILED",
  });
  console.error("No se pudo completar la limpieza de Anamnesis.");
  process.exitCode = 1;
});
