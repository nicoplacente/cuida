import { getCurrentUser } from "@/services/auth";
import { prisma } from "@/services/db";
import { getR2Object } from "@/services/r2";

export const runtime = "nodejs";

function sanitizeHeaderFileName(fileName) {
  const safeFileName = fileName
    .replace(/["\r\n]/g, "")
    .replace(/[^\x20-\x7E]/g, "_")
    .trim();

  return safeFileName || "documento";
}

export async function GET(_request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("No autorizado.", { status: 401 });
  }

  const { documentId } = await params;
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      careCircle: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      fileName: true,
      filePath: true,
      mimeType: true,
      size: true,
    },
  });

  if (!document || !document.filePath.startsWith("documents/")) {
    return new Response("Documento no encontrado.", { status: 404 });
  }

  try {
    const r2Response = await getR2Object(document.filePath);
    const headers = new Headers();
    const contentType =
      document.mimeType ||
      r2Response.headers.get("content-type") ||
      "application/octet-stream";

    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `inline; filename="${sanitizeHeaderFileName(document.fileName)}"`,
    );
    headers.set("Cache-Control", "private, no-store");

    if (document.size) {
      headers.set("Content-Length", String(document.size));
    }

    return new Response(r2Response.body, {
      headers,
      status: 200,
    });
  } catch (error) {
    return new Response("No se pudo abrir el documento.", { status: 502 });
  }
}
