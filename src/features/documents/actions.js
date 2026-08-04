"use server";

import { randomUUID } from "crypto";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import {
  deleteR2Object,
  getR2DeletionErrorMessage,
  getR2UploadErrorMessage,
  uploadR2Object,
} from "@/services/r2";
import {
  deleteDocumentObjects,
  isCareCircleDocumentKey,
} from "@/services/document-storage";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField } from "@/utils/form-data";
import { logServerError } from "@/utils/safe-logger";
import { unexpectedActionError } from "@/utils/server-action-result";
import {
  collectDescendantFolderIds,
  getFolderLocationKey,
  validateFolderName,
} from "@/features/documents/folders";

const maxFileSize = 8 * 1024 * 1024;
const maxTitleLength = 120;
const maxNotesLength = 2_000;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const allowedExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx"]);

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function validateDocumentMetadata(title, notes) {
  if (!title) return "Ingresá un título para el documento.";
  if (title.length > maxTitleLength) {
    return `El título no puede superar los ${maxTitleLength} caracteres.`;
  }
  if (notes.length > maxNotesLength) {
    return `Las notas no pueden superar los ${maxNotesLength} caracteres.`;
  }
  return null;
}

function isUniqueConstraintError(error) {
  return error?.code === "P2002";
}

async function getFolderAssignment(folderId, careCircleId) {
  if (!folderId) return { folderId: null };

  const folder = await prisma.documentFolder.findFirst({
    where: { id: folderId, careCircleId },
    select: { id: true },
  });

  return folder ? { folderId: folder.id } : null;
}

function revalidateDocuments() {
  revalidatePath("/app");
  revalidatePath("/app/documentos");
}

export async function createFolderAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const parentId = getFormField(formData, "parentId");
    const { error, name } = validateFolderName(getFormField(formData, "name"));

    if (!careCircle || !canManage) {
      return actionError("No tenés permisos para crear carpetas.");
    }
    if (error) return actionError(error);

    const parentAssignment = await getFolderAssignment(parentId, careCircle.id);
    if (!parentAssignment) {
      return actionError("La carpeta de destino no está disponible.");
    }

    await prisma.$transaction([
      prisma.documentFolder.create({
        data: {
          careCircleId: careCircle.id,
          parentId: parentAssignment.folderId,
          name,
          locationKey: getFolderLocationKey(parentAssignment.folderId, name),
        },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "DOCUMENT_FOLDER_CREATED",
          message: `${user.name} creó la carpeta ${name}.`,
        },
      }),
    ]);

    revalidateDocuments();
    return actionSuccess("Carpeta creada correctamente.");
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return actionError("Ya existe una carpeta con ese nombre en esta ubicación.");
    }
    return unexpectedActionError("createFolderAction", error);
  }
}

export async function updateFolderAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const folderId = getFormField(formData, "folderId");
    const { error, name } = validateFolderName(getFormField(formData, "name"));

    if (!careCircle || !canManage || !folderId) {
      return actionError("No tenés permisos para editar esta carpeta.");
    }
    if (error) return actionError(error);

    const folder = await prisma.documentFolder.findFirst({
      where: { id: folderId, careCircleId: careCircle.id },
      select: { id: true, parentId: true, systemKey: true },
    });

    if (!folder) return actionError("La carpeta no está disponible.");
    if (folder.systemKey) {
      return actionError("Las carpetas predeterminadas no pueden renombrarse.");
    }

    await prisma.$transaction([
      prisma.documentFolder.update({
        where: { id: folder.id },
        data: {
          name,
          locationKey: getFolderLocationKey(folder.parentId, name),
        },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "DOCUMENT_FOLDER_UPDATED",
          message: `${user.name} renombró una carpeta como ${name}.`,
        },
      }),
    ]);

    revalidateDocuments();
    return actionSuccess("Carpeta actualizada correctamente.");
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return actionError("Ya existe una carpeta con ese nombre en esta ubicación.");
    }
    return unexpectedActionError("updateFolderAction", error);
  }
}

export async function deleteFolderAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const folderId = getFormField(formData, "folderId");

    if (!careCircle || !canManage || !folderId) {
      return actionError("No tenés permisos para eliminar esta carpeta.");
    }

    const folders = await prisma.documentFolder.findMany({
      where: { careCircleId: careCircle.id },
      select: { id: true, name: true, parentId: true, systemKey: true },
    });
    const folder = folders.find((item) => item.id === folderId);

    if (!folder) return actionError("La carpeta no está disponible.");
    if (folder.systemKey) {
      return actionError("Las carpetas predeterminadas no pueden eliminarse.");
    }

    const folderIds = collectDescendantFolderIds(folders, folder.id);
    const folderIdsSet = new Set(folderIds);
    if (folders.some((item) => item.systemKey && folderIdsSet.has(item.id))) {
      return actionError("Una carpeta predeterminada no puede eliminarse.");
    }

    const documents = await prisma.document.findMany({
      where: { careCircleId: careCircle.id, folderId: { in: folderIds } },
      select: { filePath: true },
    });
    const hasInvalidObjectKey = documents.some(
      (document) => !isCareCircleDocumentKey(document.filePath, careCircle.id),
    );

    if (hasInvalidObjectKey) {
      return actionError("No se pudo validar uno de los archivos de la carpeta.");
    }

    await deleteDocumentObjects(documents.map((document) => document.filePath));
    await prisma.$transaction([
      prisma.documentFolder.delete({ where: { id: folder.id } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "DOCUMENT_FOLDER_DELETED",
          message: `${user.name} eliminó la carpeta ${folder.name} y todo su contenido.`,
        },
      }),
    ]);

    revalidateDocuments();
    return actionSuccess("Carpeta y contenido eliminados.");
  } catch (error) {
    const deletionErrorMessage = getR2DeletionErrorMessage(error);
    if (deletionErrorMessage) return actionError(deletionErrorMessage);
    return unexpectedActionError("deleteFolderAction", error);
  }
}

export async function uploadDocumentAction(_previousState, formData) {
  const title = getFormField(formData, "title");
  const notes = getFormField(formData, "notes");
  const folderId = getFormField(formData, "folderId");
  const file = formData.get("file");
  const metadataError = validateDocumentMetadata(title, notes);

  if (metadataError) return actionError(metadataError);

  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return actionError("Seleccioná un archivo para subir.");
  }

  if (file.size > maxFileSize) {
    return actionError("El archivo no puede superar los 8 MB.");
  }

  const extension = path.extname(file.name || "").toLowerCase();
  if (!allowedMimeTypes.has(file.type) || !allowedExtensions.has(extension)) {
    return actionError("Formato no permitido. Podés subir PDF, imágenes o documentos Word.");
  }

  let objectKey = null;
  let wasUploaded = false;

  try {
    const { user, careCircle, canManage } = await requireCareContext();
    if (!careCircle || !canManage) {
      return actionError("No tenés permisos para subir documentos.");
    }

    const folderAssignment = await getFolderAssignment(folderId, careCircle.id);
    if (!folderAssignment) {
      return actionError("La carpeta de destino no está disponible.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = sanitizeFileName(file.name);
    objectKey = `documents/${careCircle.id}/${Date.now()}-${randomUUID()}-${fileName}`;

    await uploadR2Object({ body: buffer, contentType: file.type, key: objectKey });
    wasUploaded = true;

    await prisma.$transaction([
      prisma.document.create({
        data: {
          careCircleId: careCircle.id,
          uploadedById: user.id,
          folderId: folderAssignment.folderId,
          title,
          fileName: file.name,
          filePath: objectKey,
          mimeType: file.type || null,
          size: file.size || null,
          notes: notes || null,
        },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "DOCUMENT_UPLOADED",
          message: `${user.name} subió el documento ${title}.`,
        },
      }),
    ]);

    revalidateDocuments();
    return actionSuccess("Documento subido correctamente.");
  } catch (error) {
    if (objectKey && wasUploaded) {
      await deleteR2Object(objectKey).catch((cleanupError) => {
        logServerError("uploadDocumentAction:cleanup", cleanupError, {
          code: "DOCUMENT_CLEANUP_FAILED",
        });
      });
    }

    const uploadErrorMessage = getR2UploadErrorMessage(error);
    if (uploadErrorMessage) return actionError(uploadErrorMessage);
    return unexpectedActionError("uploadDocumentAction", error);
  }
}

export async function updateDocumentAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const documentId = getFormField(formData, "documentId");
    const folderId = getFormField(formData, "folderId");
    const title = getFormField(formData, "title");
    const notes = getFormField(formData, "notes");
    const metadataError = validateDocumentMetadata(title, notes);

    if (!careCircle || !canManage || !documentId) {
      return actionError("Revisá los datos del documento y tus permisos.");
    }
    if (metadataError) return actionError(metadataError);

    const [document, folderAssignment] = await Promise.all([
      prisma.document.findFirst({
        where: { id: documentId, careCircleId: careCircle.id },
        select: { id: true },
      }),
      getFolderAssignment(folderId, careCircle.id),
    ]);

    if (!document) return actionError("El documento no está disponible.");
    if (!folderAssignment) return actionError("La carpeta de destino no está disponible.");

    await prisma.$transaction([
      prisma.document.update({
        where: { id: documentId },
        data: { folderId: folderAssignment.folderId, title, notes: notes || null },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "DOCUMENT_UPDATED",
          message: `${user.name} actualizó el documento ${title}.`,
        },
      }),
    ]);

    revalidateDocuments();
    return actionSuccess("Documento actualizado correctamente.");
  } catch (error) {
    return unexpectedActionError("updateDocumentAction", error);
  }
}

export async function deleteDocumentAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const documentId = getFormField(formData, "documentId");
    if (!careCircle || !canManage || !documentId) {
      return actionError("No tenés permisos para eliminar este documento.");
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, careCircleId: careCircle.id },
      select: { filePath: true, title: true },
    });
    if (!document) return actionError("El documento no está disponible.");
    if (!isCareCircleDocumentKey(document.filePath, careCircle.id)) {
      return actionError("No se pudo validar el archivo del documento.");
    }

    await deleteR2Object(document.filePath);
    await prisma.$transaction([
      prisma.document.delete({ where: { id: documentId } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "DOCUMENT_DELETED",
          message: `${user.name} eliminó el documento ${document.title}.`,
        },
      }),
    ]);

    revalidateDocuments();
    return actionSuccess("Documento eliminado.");
  } catch (error) {
    const deletionErrorMessage = getR2DeletionErrorMessage(error);
    if (deletionErrorMessage) return actionError(deletionErrorMessage);
    return unexpectedActionError("deleteDocumentAction", error);
  }
}
