"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { actionError, actionSuccess, unexpectedActionError } from "@/utils/action-result";
import { getFormField } from "@/utils/form-data";

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
    const { user, careCircle } = await requireCareContext();
    const type = getFormField(formData, "type") || "NOTE";
    const content = getFormField(formData, "content");

    if (!careCircle || !content) {
      return actionError("Ingresá el detalle del registro.");
    }

    if (!allowedLogTypes.has(type)) {
      return actionError("Seleccioná un tipo de registro válido.");
    }

    await prisma.dailyLog.create({
      data: { careCircleId: careCircle.id, userId: user.id, type, content },
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
