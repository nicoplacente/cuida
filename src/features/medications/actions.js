"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { getScheduledDate } from "@/utils/dates";
import { actionError, actionSuccess, unexpectedActionError } from "@/utils/action-result";
import { getFormField, isValidTimeInput } from "@/utils/form-data";
import {
  cancelPendingNotifications,
  getNotificationDateKey,
} from "@/services/notifications";
import {
  buildNotificationOccurrenceKey,
  parseReminderMinutes,
} from "@/utils/reminders";

export async function createMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const name = getFormField(formData, "name");
    const dose = getFormField(formData, "dose");
    const schedule = getFormField(formData, "schedule");
    const frequency = getFormField(formData, "frequency");
    const instructions = getFormField(formData, "instructions");
    const reminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );

    if (!careCircle || !name || !dose || !frequency) {
      return actionError("Completá los datos obligatorios del medicamento.");
    }
    if (!isValidTimeInput(schedule)) {
      return actionError("Ingresá un horario válido para el medicamento.");
    }
    if (reminderMinutes === null) {
      return actionError("Seleccioná una anticipación válida.");
    }

    await prisma.medication.create({
      data: {
        careCircleId: careCircle.id,
        name,
        dose,
        schedule,
        reminderMinutes,
        frequency,
        instructions: instructions || null,
      },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEDICATION_CREATED",
      message: `${user.name} agregó el medicamento ${name}.`,
    });

    revalidatePath("/app");
    revalidatePath("/app/medicamentos");
    return actionSuccess("Medicamento guardado correctamente.");
  } catch (error) {
    return unexpectedActionError("createMedicationAction", error);
  }
}

export async function updateMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");
    const name = getFormField(formData, "name");
    const dose = getFormField(formData, "dose");
    const schedule = getFormField(formData, "schedule");
    const frequency = getFormField(formData, "frequency");
    const instructions = getFormField(formData, "instructions");
    const reminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );

    if (!careCircle || !medicationId || !name || !dose || !frequency) {
      return actionError("Completá los datos obligatorios del medicamento.");
    }
    if (!isValidTimeInput(schedule)) {
      return actionError("Ingresá un horario válido para el medicamento.");
    }
    if (reminderMinutes === null) {
      return actionError("Seleccioná una anticipación válida.");
    }

    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, careCircleId: careCircle.id },
      select: { id: true },
    });

    if (!medication) {
      return actionError("El medicamento no está disponible.");
    }

    await prisma.$transaction([
      prisma.medication.update({
        where: { id: medicationId },
        data: {
          name,
          dose,
          schedule,
          reminderMinutes,
          frequency,
          instructions: instructions || null,
        },
      }),
      prisma.notification.deleteMany({
        where: { type: "MEDICATION", sourceId: medicationId, sentAt: null },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "MEDICATION_UPDATED",
          message: `${user.name} actualizó el medicamento ${name}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/medicamentos");
    return actionSuccess("Medicamento actualizado correctamente.");
  } catch (error) {
    return unexpectedActionError("updateMedicationAction", error);
  }
}

export async function administerMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");

    if (!careCircle || !medicationId) {
      return actionError("No pudimos identificar el medicamento.");
    }

    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        careCircleId: careCircle.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        dose: true,
        schedule: true,
        reminderMinutes: true,
      },
    });

    if (!medication) {
      return actionError("El medicamento no está disponible.");
    }

    const scheduledFor = getScheduledDate(medication.schedule);
    const existingAdministration = await prisma.medicationAdministration.findUnique({
      where: {
        medicationId_scheduledFor: { medicationId, scheduledFor },
      },
      select: { id: true },
    });

    if (existingAdministration) {
      return actionError("Este horario ya fue marcado como administrado.");
    }

    await prisma.medicationAdministration.create({
      data: {
        medicationId,
        userId: user.id,
        scheduledFor,
      },
    });

    await cancelPendingNotifications(
      "MEDICATION",
      medicationId,
      buildNotificationOccurrenceKey({
        type: "MEDICATION",
        sourceId: medicationId,
        dateKey: getNotificationDateKey(scheduledFor),
        time: medication.schedule,
        reminderMinutes: medication.reminderMinutes,
      }),
    );

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEDICATION_ADMINISTERED",
      message: `${user.name} administró ${medication.name} ${medication.dose}.`,
    });

    revalidatePath("/app");
    revalidatePath("/app/medicamentos");
    return actionSuccess("Administración registrada correctamente.");
  } catch (error) {
    return unexpectedActionError("administerMedicationAction", error);
  }
}

export async function toggleMedicationAction(_previousState, formData) {
  try {
    const { careCircle } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");
    const active = getFormField(formData, "active") === "true";

    if (!careCircle || !medicationId) {
      return actionError("No pudimos identificar el medicamento.");
    }

    const medication = await prisma.medication.updateMany({
      where: { id: medicationId, careCircleId: careCircle.id },
      data: { active },
    });

    if (medication.count !== 1) {
      return actionError("El medicamento no está disponible.");
    }

    if (!active) {
      await cancelPendingNotifications("MEDICATION", medicationId);
    }

    revalidatePath("/app/medicamentos");
    return actionSuccess(active ? "Medicamento activado." : "Medicamento desactivado.");
  } catch (error) {
    return unexpectedActionError("toggleMedicationAction", error);
  }
}

export async function deleteMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");

    if (!careCircle || !medicationId) {
      return actionError("No pudimos identificar el medicamento.");
    }

    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, careCircleId: careCircle.id },
      select: { name: true },
    });

    if (!medication) {
      return actionError("El medicamento no está disponible.");
    }

    await cancelPendingNotifications("MEDICATION", medicationId);
    await prisma.medication.delete({ where: { id: medicationId } });
    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEDICATION_DELETED",
      message: `${user.name} eliminó el medicamento ${medication.name}.`,
    });

    revalidatePath("/app");
    revalidatePath("/app/medicamentos");
    return actionSuccess("Medicamento eliminado.");
  } catch (error) {
    return unexpectedActionError("deleteMedicationAction", error);
  }
}
