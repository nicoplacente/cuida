import { deleteR2Object } from "@/services/r2";

const deletionBatchSize = 4;

export function isCareCircleDocumentKey(filePath, careCircleId) {
  return filePath.startsWith(`documents/${careCircleId}/`);
}

export async function deleteDocumentObjects(filePaths) {
  for (let index = 0; index < filePaths.length; index += deletionBatchSize) {
    const batch = filePaths.slice(index, index + deletionBatchSize);
    await Promise.all(batch.map((filePath) => deleteR2Object(filePath)));
  }
}
