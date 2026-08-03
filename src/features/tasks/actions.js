"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { cancelPendingNotifications } from "@/services/notifications";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField, isValidTimeInput, parseDateInput } from "@/utils/form-data";
import { parseReminderMinutes } from "@/utils/reminders";
import { unexpectedActionError } from "@/utils/server-action-result";

async function isValidAssignee(assignedToId, careCircleId) {
  if (!assignedToId) return true;

  const membership = await prisma.careCircleMember.findUnique({
    where: {
      userId_careCircleId: { userId: assignedToId, careCircleId },
    },
    select: { id: true },
  });

  return Boolean(membership);
}

export async function createTaskAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const title = getFormField(formData, "title");
    const description = getFormField(formData, "description");
    const scheduledTime = getFormField(formData, "scheduledTime");
    const scheduledDate = getFormField(formData, "scheduledDate");
    const assignedToId = getFormField(formData, "assignedToId");
    const parsedReminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );
    const parsedScheduledDate = scheduledDate ? parseDateInput(scheduledDate) : null;

    if (!careCircle || !canManage || !title) {
      return actionError("Ingresá un título para la tarea.");
    }
    if (parsedReminderMinutes === null) {
      return actionError("Seleccioná una anticipación válida.");
    }
    if (scheduledDate && !parsedScheduledDate) {
      return actionError("Ingresá una fecha válida para la tarea.");
    }
    if (scheduledTime && !isValidTimeInput(scheduledTime)) {
      return actionError("Ingresá un horario válido para la tarea.");
    }

    if (!(await isValidAssignee(assignedToId, careCircle.id))) {
      return actionError("Seleccioná un integrante válido del círculo.");
    }

    const reminderMinutes = parsedScheduledDate && scheduledTime
      ? parsedReminderMinutes
      : 0;

    await prisma.careTask.create({
      data: {
        careCircleId: careCircle.id,
        title,
        description: description || null,
        scheduledTime: scheduledTime || null,
        scheduledDate: parsedScheduledDate,
        reminderMinutes,
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
    return actionSuccess("Tarea creada correctamente.");
  } catch (error) {
    return unexpectedActionError("createTaskAction", error);
  }
}

export async function updateTaskAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const taskId = getFormField(formData, "taskId");
    const title = getFormField(formData, "title");
    const description = getFormField(formData, "description");
    const scheduledTime = getFormField(formData, "scheduledTime");
    const scheduledDate = getFormField(formData, "scheduledDate");
    const assignedToId = getFormField(formData, "assignedToId");
    const parsedReminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );
    const parsedScheduledDate = scheduledDate ? parseDateInput(scheduledDate) : null;

    if (!careCircle || !canManage || !taskId || !title) {
      return actionError("Revisá los datos de la tarea.");
    }
    if (parsedReminderMinutes === null) {
      return actionError("Seleccioná una anticipación válida.");
    }
    if (scheduledDate && !parsedScheduledDate) {
      return actionError("Ingresá una fecha válida para la tarea.");
    }
    if (scheduledTime && !isValidTimeInput(scheduledTime)) {
      return actionError("Ingresá un horario válido para la tarea.");
    }

    if (!(await isValidAssignee(assignedToId, careCircle.id))) {
      return actionError("Seleccioná un integrante válido del círculo.");
    }

    const task = await prisma.careTask.findFirst({
      where: { id: taskId, careCircleId: careCircle.id },
      select: { id: true },
    });

    if (!task) {
      return actionError("La tarea no está disponible.");
    }

    const reminderMinutes = parsedScheduledDate && scheduledTime
      ? parsedReminderMinutes
      : 0;

    await prisma.$transaction([
      prisma.careTask.update({
        where: { id: taskId },
        data: {
          title,
          description: description || null,
          scheduledTime: scheduledTime || null,
          scheduledDate: parsedScheduledDate,
          reminderMinutes,
          assignedToId: assignedToId || null,
        },
      }),
      prisma.notification.deleteMany({
        where: { type: "TASK", sourceId: taskId, sentAt: null },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "TASK_UPDATED",
          message: `${user.name} actualizó la tarea ${title}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/tareas");
    return actionSuccess("Tarea actualizada correctamente.");
  } catch (error) {
    return unexpectedActionError("updateTaskAction", error);
  }
}

export async function completeTaskAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const taskId = getFormField(formData, "taskId");

    if (!careCircle || !canManage || !taskId) {
      return actionError("No pudimos identificar la tarea.");
    }

    const task = await prisma.careTask.updateMany({
      where: { id: taskId, careCircleId: careCircle.id, completed: false },
      data: { completed: true, completedById: user.id, completedAt: new Date() },
    });

    if (task.count !== 1) {
      return actionError("La tarea ya fue completada o no está disponible.");
    }

    await cancelPendingNotifications("TASK", taskId);
    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "TASK_COMPLETED",
      message: `${user.name} completó una tarea compartida.`,
    });

    revalidatePath("/app");
    revalidatePath("/app/tareas");
    return actionSuccess("Tarea completada.");
  } catch (error) {
    return unexpectedActionError("completeTaskAction", error);
  }
}

export async function deleteTaskAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const taskId = getFormField(formData, "taskId");
    if (!careCircle || !canManage || !taskId) {
      return actionError("No tenés permisos para eliminar esta tarea.");
    }

    const task = await prisma.careTask.findFirst({
      where: { id: taskId, careCircleId: careCircle.id },
      select: { title: true },
    });
    if (!task) return actionError("La tarea no está disponible.");

    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { type: "TASK", sourceId: taskId } }),
      prisma.careTask.delete({ where: { id: taskId } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "TASK_DELETED",
          message: `${user.name} eliminó la tarea ${task.title}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/tareas");
    return actionSuccess("Tarea eliminada.");
  } catch (error) {
    return unexpectedActionError("deleteTaskAction", error);
  }
}
