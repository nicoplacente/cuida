export const MAX_FOLDER_NAME_LENGTH = 80;

export const DEFAULT_DOCUMENT_FOLDERS = Object.freeze([
  Object.freeze({ name: "Historia clínica", systemKey: "MEDICAL_HISTORY" }),
  Object.freeze({ name: "Anamnesis", systemKey: "ANAMNESIS" }),
]);

export function normalizeFolderName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

export function getFolderNameKey(name) {
  return normalizeFolderName(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function getFolderLocationKey(parentId, name) {
  return `${parentId || "root"}:${getFolderNameKey(name)}`;
}

export function validateFolderName(name) {
  const normalizedName = normalizeFolderName(name);

  if (!normalizedName) {
    return { error: "Ingresá un nombre para la carpeta.", name: "" };
  }

  if (normalizedName.length > MAX_FOLDER_NAME_LENGTH) {
    return {
      error: `El nombre no puede superar los ${MAX_FOLDER_NAME_LENGTH} caracteres.`,
      name: normalizedName,
    };
  }

  return { error: null, name: normalizedName };
}

export function collectDescendantFolderIds(folders, rootId) {
  const childrenByParentId = new Map();

  for (const folder of folders) {
    const children = childrenByParentId.get(folder.parentId) || [];
    children.push(folder.id);
    childrenByParentId.set(folder.parentId, children);
  }

  const collectedIds = [];
  const pendingIds = [rootId];
  const visitedIds = new Set();

  while (pendingIds.length) {
    const folderId = pendingIds.pop();
    if (!folderId || visitedIds.has(folderId)) continue;

    visitedIds.add(folderId);
    collectedIds.push(folderId);
    pendingIds.push(...(childrenByParentId.get(folderId) || []));
  }

  return collectedIds;
}

export function getFolderPath(foldersById, folderId) {
  const path = [];
  const visitedIds = new Set();
  let currentFolder = foldersById.get(folderId) || null;

  while (currentFolder && !visitedIds.has(currentFolder.id)) {
    visitedIds.add(currentFolder.id);
    path.unshift(currentFolder);
    currentFolder = currentFolder.parentId
      ? foldersById.get(currentFolder.parentId) || null
      : null;
  }

  return path;
}

export function getFolderPathLabel(foldersById, folderId) {
  const names = getFolderPath(foldersById, folderId).map((folder) => folder.name);
  return ["Documentos", ...names].join(" / ");
}

export function matchesDocumentSearch(document, query) {
  const searchKey = getFolderNameKey(query);
  if (!searchKey) return true;

  return [document.title, document.fileName, document.notes]
    .some((value) => getFolderNameKey(value).includes(searchKey));
}
