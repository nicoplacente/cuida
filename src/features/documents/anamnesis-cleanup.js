import { collectDescendantFolderIds } from "./folders.js";
import { isCareCircleDocumentKey } from "../../services/document-storage-core.js";

export const ANAMNESIS_SYSTEM_KEY = "ANAMNESIS";

export async function removeAnamnesisContent({ database, deleteDocumentObjects }) {
  const roots = await database.documentFolder.findMany({
    where: { systemKey: ANAMNESIS_SYSTEM_KEY },
    select: { careCircleId: true, id: true },
  });
  const totals = { documents: 0, folders: 0, roots: roots.length };

  for (const root of roots) {
    const folders = await database.documentFolder.findMany({
      where: { careCircleId: root.careCircleId },
      select: { id: true, parentId: true },
    });
    const folderIds = collectDescendantFolderIds(folders, root.id);
    const documents = await database.document.findMany({
      where: {
        careCircleId: root.careCircleId,
        folderId: { in: folderIds },
      },
      select: { filePath: true },
    });
    const hasInvalidObjectKey = documents.some(
      (document) => !isCareCircleDocumentKey(document.filePath, root.careCircleId),
    );

    if (hasInvalidObjectKey) {
      throw new Error("No se pudo validar uno de los archivos de Anamnesis.");
    }

    await deleteDocumentObjects(documents.map((document) => document.filePath));
    await database.documentFolder.delete({ where: { id: root.id } });

    totals.documents += documents.length;
    totals.folders += folderIds.length;
  }

  return totals;
}
