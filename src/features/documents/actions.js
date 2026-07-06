"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";

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

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function documentsRedirect(params) {
  redirect(`/app/documentos?${new URLSearchParams(params).toString()}`);
}

export async function uploadDocumentAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const title = getField(formData, "title");
  const notes = getField(formData, "notes");
  const file = formData.get("file");

  if (!careCircle) {
    documentsRedirect({ error: "No hay un círculo de cuidado activo." });
  }

  if (!title) {
    documentsRedirect({ error: "Ingresá un título para el documento." });
  }

  if (!file || file.size === 0) {
    documentsRedirect({ error: "Seleccioná un archivo para subir." });
  }

  if (file.size > maxFileSize) {
    documentsRedirect({ error: "El archivo no puede superar los 8 MB." });
  }

  const extension = path.extname(file.name || "").toLowerCase();
  const isAllowedMimeType = allowedMimeTypes.has(file.type);
  const isAllowedExtension = allowedExtensions.has(extension);

  if (!isAllowedMimeType || !isAllowedExtension) {
    documentsRedirect({
      error: "Formato no permitido. Podés subir PDF, imágenes o documentos Word.",
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
  const filePath = path.join(uploadDir, fileName);
  const publicPath = `/uploads/documents/${fileName}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  try {
    await prisma.document.create({
      data: {
        careCircleId: careCircle.id,
        uploadedById: user.id,
        title,
        fileName: file.name,
        filePath: publicPath,
        mimeType: file.type || null,
        size: file.size || null,
        notes: notes || null,
      },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "DOCUMENT_UPLOADED",
      message: `${user.name} subió el documento ${title}.`,
    });
  } catch (error) {
    await unlink(filePath).catch(() => null);
    documentsRedirect({
      error: "No se pudo guardar el documento. Intentá nuevamente.",
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/documentos");
  documentsRedirect({ success: "Documento subido correctamente." });
}
