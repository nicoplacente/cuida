"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField, isValidTimeInput, parseDateInput } from "@/utils/form-data";
import { getMedicationOccurrences } from "@/utils/medication-schedules";
import { parseReminderMinutes } from "@/utils/reminders";
import { unexpectedActionError } from "@/utils/server-action-result";

const scheduleTypes = new Set(["DAILY_TIMES", "INTERVAL"]);

function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function parseMedicationInput(formData) {
  const name = getFormField(formData, "name");
  const dose = getFormField(formData, "dose");
  const instructions = getFormField(formData, "instructions");
  const scheduleType = getFormField(formData, "scheduleType");
  const startDate = parseDateInput(getFormField(formData, "startDate"));
  const hasNoEndDate = getFormField(formData, "hasNoEndDate") === "true";
  const endDateValue = getFormField(formData, "endDate");
  const endDate = hasNoEndDate ? null : parseDateInput(endDateValue);
  const reminderMinutes = parseReminderMinutes(getFormField(formData, "reminderMinutes"));

  if (!name || !dose || !scheduleTypes.has(scheduleType) || !startDate) {
    return { error: "Completá los datos obligatorios del medicamento." };
  }
  if (!hasNoEndDate && !endDate) {
    return { error: "Ingresá una fecha de finalización válida o elegí sin fecha límite." };
  }
  if (endDate && endDate < startDate) {
    return { error: "La fecha de finalización no puede ser anterior a la fecha de inicio." };
  }
  if (!reminderMinutes) {
    return { error: "Seleccioná un recordatorio de 15, 30 o 60 minutos." };
  }

  if (scheduleType === "DAILY_TIMES") {
    const dailyDoseCount = parsePositiveInteger(getFormField(formData, "dailyDoseCount"));
    const times = formData
      .getAll("scheduleTimes")
      .map((value) => String(value).trim())
      .filter(Boolean);
    const uniqueTimes = [...new Set(times)];

    if (!dailyDoseCount || times.length !== dailyDoseCount) {
      return { error: "La cantidad de horarios debe coincidir con las tomas por día." };
    }
    if (uniqueTimes.length !== times.length || times.some((time) => !isValidTimeInput(time))) {
      return { error: "Ingresá horarios válidos y sin repetir." };
    }

    const sortedTimes = uniqueTimes.toSorted();
    return {
      data: {
        name,
        dose,
        instructions: instructions || null,
        scheduleType,
        startDate,
        endDate,
        intervalHours: null,
        dailyDoseCount,
        schedule: sortedTimes[0],
        frequency: dailyDoseCount === 1 ? "1 vez por día" : `${dailyDoseCount} veces por día`,
        reminderMinutes,
      },
      times: sortedTimes,
    };
  }

  const intervalHours = parsePositiveInteger(getFormField(formData, "intervalHours"));
  const firstDoseTime = getFormField(formData, "firstDoseTime");
  if (!intervalHours || !isValidTimeInput(firstDoseTime)) {
    return { error: "Ingresá un intervalo positivo y la hora de la primera toma." };
  }

  return {
    data: {
      name,
      dose,
      instructions: instructions || null,
      scheduleType,
      startDate,
      endDate,
      intervalHours,
      dailyDoseCount: 1,
      schedule: firstDoseTime,
      frequency: `Cada ${intervalHours} horas`,
      reminderMinutes,
    },
    times: [],
  };
}

function revalidateMedicationPaths() {
  revalidatePath("/app");
  revalidatePath("/app/medicamentos");
}

export async function createMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    if (!careCircle || !canManage) {
      return actionError("No tenés permisos para agregar medicamentos.");
    }

    const parsed = parseMedicationInput(formData);
    if (parsed.error) return actionError(parsed.error);

    await prisma.medication.create({
      data: {
        careCircleId: careCircle.id,
        ...parsed.data,
        times: parsed.times.length
          ? { create: parsed.times.map((time) => ({ time })) }
          : undefined,
      },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEDICATION_CREATED",
      message: `${user.name} agregó el medicamento ${parsed.data.name}.`,
    });

    revalidateMedicationPaths();
    return actionSuccess("Medicamento guardado correctamente.");
  } catch (error) {
    return unexpectedActionError("createMedicationAction", error);
  }
}

export async function updateMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");
    if (!careCircle || !canManage || !medicationId) {
      return actionError("No tenés permisos para editar este medicamento.");
    }

    const parsed = parseMedicationInput(formData);
    if (parsed.error) return actionError(parsed.error);

    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, careCircleId: careCircle.id },
      select: { id: true },
    });
    if (!medication) return actionError("El medicamento no está disponible.");

    const operations = [
      prisma.medication.update({ where: { id: medicationId }, data: parsed.data }),
      prisma.medicationSchedule.deleteMany({ where: { medicationId } }),
      prisma.notification.deleteMany({
        where: { type: "MEDICATION", sourceId: medicationId, sentAt: null },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "MEDICATION_UPDATED",
          message: `${user.name} actualizó el medicamento ${parsed.data.name}.`,
        },
      }),
    ];
    if (parsed.times.length) {
      operations.splice(
        2,
        0,
        prisma.medicationSchedule.createMany({
          data: parsed.times.map((time) => ({ medicationId, time })),
        }),
      );
    }
    await prisma.$transaction(operations);

    revalidateMedicationPaths();
    return actionSuccess("Medicamento actualizado correctamente.");
  } catch (error) {
    return unexpectedActionError("updateMedicationAction", error);
  }
}

export async function administerMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");
    const scheduledFor = new Date(getFormField(formData, "scheduledFor"));

    if (!careCircle || !canManage || !medicationId || Number.isNaN(scheduledFor.getTime())) {
      return actionError("No pudimos identificar la toma del medicamento.");
    }

    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, careCircleId: careCircle.id, active: true },
      include: { times: { select: { time: true } } },
    });
    if (!medication) return actionError("El medicamento no está disponible.");

    const matchingOccurrence = getMedicationOccurrences(
      medication,
      new Date(scheduledFor.getTime() - 1000),
      new Date(scheduledFor.getTime() + 1000),
    ).some((occurrence) => occurrence.scheduledFor.getTime() === scheduledFor.getTime());
    if (!matchingOccurrence) {
      return actionError("La toma seleccionada no pertenece al tratamiento actual.");
    }

    const existingAdministration = await prisma.medicationAdministration.findUnique({
      where: { medicationId_scheduledFor: { medicationId, scheduledFor } },
      select: { id: true },
    });
    if (existingAdministration) {
      return actionError("Esta toma ya fue marcada como administrada.");
    }

    await prisma.$transaction([
      prisma.medicationAdministration.create({
        data: { medicationId, userId: user.id, scheduledFor },
      }),
      prisma.notification.deleteMany({
        where: {
          type: "MEDICATION",
          sourceId: medicationId,
          occurrenceFor: scheduledFor,
          sentAt: null,
        },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "MEDICATION_ADMINISTERED",
          message: `${user.name} administró ${medication.name} ${medication.dose}.`,
        },
      }),
    ]);

    revalidateMedicationPaths();
    return actionSuccess("Administración registrada correctamente.");
  } catch (error) {
    return unexpectedActionError("administerMedicationAction", error);
  }
}

export async function toggleMedicationAction(_previousState, formData) {
  try {
    const { careCircle, canManage } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");
    const active = getFormField(formData, "active") === "true";
    if (!careCircle || !canManage || !medicationId) {
      return actionError("No tenés permisos para modificar este medicamento.");
    }

    const medicationWasUpdated = await prisma.$transaction(async (transaction) => {
      const medication = await transaction.medication.updateMany({
        where: { id: medicationId, careCircleId: careCircle.id },
        data: { active },
      });

      if (medication.count !== 1) return false;

      if (!active) {
        await transaction.notification.deleteMany({
          where: { type: "MEDICATION", sourceId: medicationId, sentAt: null },
        });
      }

      return true;
    });
    if (!medicationWasUpdated) return actionError("El medicamento no está disponible.");

    revalidateMedicationPaths();
    return actionSuccess(active ? "Medicamento activado." : "Medicamento desactivado.");
  } catch (error) {
    return unexpectedActionError("toggleMedicationAction", error);
  }
}

export async function deleteMedicationAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const medicationId = getFormField(formData, "medicationId");
    if (!careCircle || !canManage || !medicationId) {
      return actionError("No tenés permisos para eliminar este medicamento.");
    }

    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, careCircleId: careCircle.id },
      select: { name: true },
    });
    if (!medication) return actionError("El medicamento no está disponible.");

    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { type: "MEDICATION", sourceId: medicationId } }),
      prisma.medication.delete({ where: { id: medicationId } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "MEDICATION_DELETED",
          message: `${user.name} eliminó el medicamento ${medication.name}.`,
        },
      }),
    ]);

    revalidateMedicationPaths();
    return actionSuccess("Medicamento eliminado.");
  } catch (error) {
    return unexpectedActionError("deleteMedicationAction", error);
  }
}
