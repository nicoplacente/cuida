import "server-only";

import { deleteR2Object } from "@/services/r2";
import {
  deleteDocumentObjectsWith,
  isCareCircleDocumentKey,
} from "@/services/document-storage-core";

export { isCareCircleDocumentKey };

export function deleteDocumentObjects(filePaths) {
  return deleteDocumentObjectsWith(filePaths, deleteR2Object);
}
