"use server";

import { randomUUID } from "crypto";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import {
  deleteR2Object,
  getR2UploadErrorMessage,
  uploadR2Object,
} from "@/services/r2";
import { actionError, actionSuccess, unexpectedActionError } from "@/utils/action-result";
import { getFormField } from "@/utils/form-data";

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
    const { user, careCircle } = await requireCareContext();
    if (!careCircle) {
      return actionError("No hay un círculo de cuidado activo.");
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
        console.error("[uploadDocumentAction:cleanup]", cleanupError);
      });
    }

    const uploadErrorMessage = getR2UploadErrorMessage(error);
    if (uploadErrorMessage) {
      return actionError(uploadErrorMessage);
    }

    return unexpectedActionError("uploadDocumentAction", error);
  }
}
