"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/services/auth";
import { prisma } from "@/services/db";

export async function markNotificationReadAction(formData) {
  const user = await requireUser();
  const notificationId = String(formData.get("notificationId") || "");
  if (!notificationId) return;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, scheduledFor: { lte: new Date() } },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
}
