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
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField } from "@/utils/form-data";
import { logServerError } from "@/utils/safe-logger";
import { unexpectedActionError } from "@/utils/server-action-result";

const maxFileSize = 8 * 1024 * 1024;
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

export async function uploadDocumentAction(_previousState, formData) {
  const title = getFormField(formData, "title");
  const notes = getFormField(formData, "notes");
  const file = formData.get("file");

  if (!title) {
    return actionError("Ingresá un título para el documento.");
  }

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

    revalidatePath("/app");
    revalidatePath("/app/documentos");
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
    if (uploadErrorMessage) {
      return actionError(uploadErrorMessage);
    }

    return unexpectedActionError("uploadDocumentAction", error);
  }
}

export async function updateDocumentAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const documentId = getFormField(formData, "documentId");
    const title = getFormField(formData, "title");
    const notes = getFormField(formData, "notes");
    if (!careCircle || !canManage || !documentId || !title) {
      return actionError("Revisá los datos del documento y tus permisos.");
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, careCircleId: careCircle.id },
      select: { id: true },
    });
    if (!document) return actionError("El documento no está disponible.");

    await prisma.$transaction([
      prisma.document.update({
        where: { id: documentId },
        data: { title, notes: notes || null },
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

    revalidatePath("/app");
    revalidatePath("/app/documentos");
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

    revalidatePath("/app");
    revalidatePath("/app/documentos");
    return actionSuccess("Documento eliminado.");
  } catch (error) {
    const deletionErrorMessage = getR2DeletionErrorMessage(error);
    if (deletionErrorMessage) return actionError(deletionErrorMessage);
    return unexpectedActionError("deleteDocumentAction", error);
  }
}
