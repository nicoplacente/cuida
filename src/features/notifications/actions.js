"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/services/auth";
import { prisma } from "@/services/db";
import { actionError, actionSuccess, unexpectedActionError } from "@/utils/action-result";
import { getFormField } from "@/utils/form-data";

export async function markNotificationReadAction(_previousState, formData) {
  try {
    const user = await requireUser();
    const notificationId = getFormField(formData, "notificationId");
    if (!notificationId) {
      return actionError("No pudimos identificar la notificación.");
    }

    const notification = await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    if (notification.count !== 1) {
      return actionError("La notificación ya fue actualizada.");
    }

    revalidatePath("/app", "layout");
    return actionSuccess("Notificación marcada como leída.");
  } catch (error) {
    return unexpectedActionError("markNotificationReadAction", error);
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null, scheduledFor: { lte: new Date() } },
      data: { readAt: new Date() },
    });
    revalidatePath("/app", "layout");
    return actionSuccess("Notificaciones marcadas como leídas.");
  } catch (error) {
    return unexpectedActionError("markAllNotificationsReadAction", error);
  }
}
