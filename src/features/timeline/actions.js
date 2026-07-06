"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

export async function createLogAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const type = getField(formData, "type") || "NOTE";
  const content = getField(formData, "content");

  if (!careCircle || !content) {
    return;
  }

  await prisma.dailyLog.create({
    data: {
      careCircleId: careCircle.id,
      userId: user.id,
      type,
      content,
    },
  });

  await createActivity({
    careCircleId: careCircle.id,
    userId: user.id,
    type: "NOTE_CREATED",
    message: `${user.name} agregó una nota al historial diario.`,
  });

  revalidatePath("/app");
  revalidatePath("/app/historial");
}
