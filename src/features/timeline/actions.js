"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { actionError, actionSuccess, unexpectedActionError } from "@/utils/action-result";
import { getFormField, parseDateTimeInput } from "@/utils/form-data";

const allowedLogTypes = new Set([
  "MEAL",
  "MOOD",
  "SLEEP",
  "SYMPTOM",
  "BEHAVIOR",
  "INCIDENT",
  "NOTE",
]);

export async function createLogAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const type = getFormField(formData, "type") || "NOTE";
    const content = getFormField(formData, "content");
    const occurredAtValue = getFormField(formData, "occurredAt");
    const occurredAt = occurredAtValue ? parseDateTimeInput(occurredAtValue) : new Date();

    if (!careCircle || !canManage || !content || !occurredAt) {
      return actionError("Ingresá el detalle del registro.");
    }

    if (!allowedLogTypes.has(type)) {
      return actionError("Seleccioná un tipo de registro válido.");
    }

    await prisma.dailyLog.create({
      data: { careCircleId: careCircle.id, userId: user.id, type, content, occurredAt },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "NOTE_CREATED",
      message: `${user.name} agregó una nota al historial diario.`,
    });

    revalidatePath("/app");
    revalidatePath("/app/historial");
    return actionSuccess("Registro agregado al historial.");
  } catch (error) {
    return unexpectedActionError("createLogAction", error);
  }
}

export async function updateLogAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const logId = getFormField(formData, "logId");
    const type = getFormField(formData, "type");
    const content = getFormField(formData, "content");
    const occurredAt = parseDateTimeInput(getFormField(formData, "occurredAt"));
    if (!careCircle || !canManage || !logId || !content || !occurredAt) {
      return actionError("Revisá los datos del registro y tus permisos.");
    }
    if (!allowedLogTypes.has(type)) return actionError("Seleccioná un tipo válido.");

    const log = await prisma.dailyLog.findFirst({
      where: { id: logId, careCircleId: careCircle.id },
      select: { id: true },
    });
    if (!log) return actionError("El registro no está disponible.");

    await prisma.$transaction([
      prisma.dailyLog.update({ where: { id: logId }, data: { type, content, occurredAt } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "NOTE_UPDATED",
          message: `${user.name} actualizó un registro del historial diario.`,
        },
      }),
    ]);
    revalidatePath("/app");
    revalidatePath("/app/historial");
    return actionSuccess("Registro actualizado correctamente.");
  } catch (error) {
    return unexpectedActionError("updateLogAction", error);
  }
}

export async function deleteLogAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const logId = getFormField(formData, "logId");
    if (!careCircle || !canManage || !logId) {
      return actionError("No tenés permisos para eliminar este registro.");
    }

    const log = await prisma.dailyLog.findFirst({
      where: { id: logId, careCircleId: careCircle.id },
      select: { id: true },
    });
    if (!log) return actionError("El registro no está disponible.");

    await prisma.$transaction([
      prisma.dailyLog.delete({ where: { id: logId } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "NOTE_DELETED",
          message: `${user.name} eliminó un registro del historial diario.`,
        },
      }),
    ]);
    revalidatePath("/app");
    revalidatePath("/app/historial");
    return actionSuccess("Registro eliminado.");
  } catch (error) {
    return unexpectedActionError("deleteLogAction", error);
  }
}
