const deletionBatchSize = 4;

export function isCareCircleDocumentKey(filePath, careCircleId) {
  return filePath.startsWith(`documents/${careCircleId}/`);
}

export async function deleteDocumentObjectsWith(filePaths, deleteObject) {
  for (let index = 0; index < filePaths.length; index += deletionBatchSize) {
    const batch = filePaths.slice(index, index + deletionBatchSize);
    await Promise.all(batch.map((filePath) => deleteObject(filePath)));
  }
}
