"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { cancelPendingNotifications } from "@/services/notifications";

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

export async function createTaskAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const title = getField(formData, "title");
  const description = getField(formData, "description");
  const scheduledTime = getField(formData, "scheduledTime");
  const scheduledDate = getField(formData, "scheduledDate");
  const assignedToId = getField(formData, "assignedToId");

  if (!careCircle || !title) {
    return;
  }

  await prisma.careTask.create({
    data: {
      careCircleId: careCircle.id,
      title,
      description: description || null,
      scheduledTime: scheduledTime || null,
      scheduledDate: scheduledDate ? new Date(`${scheduledDate}T12:00:00Z`) : null,
      assignedToId: assignedToId || null,
    },
  });

  await createActivity({
    careCircleId: careCircle.id,
    userId: user.id,
    type: "TASK_CREATED",
    message: `${user.name} creó la tarea ${title}.`,
  });

  revalidatePath("/app");
  revalidatePath("/app/tareas");
}

export async function completeTaskAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const taskId = getField(formData, "taskId");

  if (!careCircle || !taskId) {
    return;
  }

  const task = await prisma.careTask.updateMany({
    where: {
      id: taskId,
      careCircleId: careCircle.id,
      completed: false,
    },
    data: {
      completed: true,
      completedById: user.id,
      completedAt: new Date(),
    },
  });

  if (task.count > 0) {
    await cancelPendingNotifications("TASK", taskId);

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "TASK_COMPLETED",
      message: `${user.name} completó una tarea compartida.`,
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/tareas");
}
