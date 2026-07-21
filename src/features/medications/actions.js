"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { getScheduledDate } from "@/utils/dates";
import {
  cancelPendingNotifications,
  getNotificationDateKey,
} from "@/services/notifications";

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

export async function createMedicationAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const name = getField(formData, "name");
  const dose = getField(formData, "dose");
  const schedule = getField(formData, "schedule");
  const frequency = getField(formData, "frequency");
  const instructions = getField(formData, "instructions");

  if (!careCircle || !name || !dose || !schedule || !frequency) {
    return;
  }

  await prisma.medication.create({
    data: {
      careCircleId: careCircle.id,
      name,
      dose,
      schedule,
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
}

export async function administerMedicationAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const medicationId = getField(formData, "medicationId");
  const schedule = getField(formData, "schedule");

  if (!careCircle || !medicationId || !schedule) {
    return;
  }

  const medication = await prisma.medication.findFirst({
    where: {
      id: medicationId,
      careCircleId: careCircle.id,
      active: true,
    },
  });

  if (!medication) {
    return;
  }

  const scheduledFor = getScheduledDate(schedule);

  const administration = await prisma.medicationAdministration
    .create({
      data: {
        medicationId,
        userId: user.id,
        scheduledFor,
      },
    })
    .catch(() => null);

  if (administration) {
    await cancelPendingNotifications(
      "MEDICATION",
      medicationId,
      `MEDICATION:${medicationId}:${getNotificationDateKey(scheduledFor)}`,
    );

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEDICATION_ADMINISTERED",
      message: `${user.name} administró ${medication.name} ${medication.dose}.`,
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/medicamentos");
}

export async function toggleMedicationAction(formData) {
  const { careCircle } = await requireCareContext();
  const medicationId = getField(formData, "medicationId");
  const active = getField(formData, "active") === "true";

  if (!careCircle || !medicationId) {
    return;
  }

  await prisma.medication.updateMany({
    where: {
      id: medicationId,
      careCircleId: careCircle.id,
    },
    data: { active },
  });

  if (!active) {
    await cancelPendingNotifications("MEDICATION", medicationId);
  }

  revalidatePath("/app/medicamentos");
}

export async function deleteMedicationAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const medicationId = getField(formData, "medicationId");

  if (!careCircle || !medicationId) {
    return;
  }

  const medication = await prisma.medication.findFirst({
    where: {
      id: medicationId,
      careCircleId: careCircle.id,
    },
    select: {
      name: true,
    },
  });

  if (!medication) {
    return;
  }

  await cancelPendingNotifications("MEDICATION", medicationId);

  await prisma.medication.delete({
    where: {
      id: medicationId,
    },
  });

  await createActivity({
    careCircleId: careCircle.id,
    userId: user.id,
    type: "MEDICATION_DELETED",
    message: `${user.name} eliminó el medicamento ${medication.name}.`,
  });

  revalidatePath("/app");
  revalidatePath("/app/medicamentos");
}
