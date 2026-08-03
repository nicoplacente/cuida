"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { requireUser, setActiveCareCircleId } from "@/services/auth";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField, parseDateInput } from "@/utils/form-data";
import { calculateAge } from "@/utils/patients";
import { unexpectedActionError } from "@/utils/server-action-result";
import {
  DEFAULT_DOCUMENT_FOLDERS,
  getFolderLocationKey,
} from "@/features/documents/folders";

export async function switchCareCircleAction(_previousState, formData) {
  try {
    const user = await requireUser();
    const careCircleId = getFormField(formData, "careCircleId");
    const membership = await prisma.careCircleMember.findUnique({
      where: { userId_careCircleId: { userId: user.id, careCircleId } },
      select: { id: true },
    });

    if (!membership) {
      return actionError("No tenés acceso a ese círculo de cuidado.");
    }

    await setActiveCareCircleId(careCircleId);
    revalidatePath("/app");
  } catch (error) {
    return unexpectedActionError("switchCareCircleAction", error);
  }

  redirect("/app");
}

export async function createCareCircleAction(_previousState, formData) {
  try {
    const user = await requireUser();
    const patientName = getFormField(formData, "patientName");
    const birthDateValue = getFormField(formData, "birthDate");
    const birthDate = parseDateInput(birthDateValue);
    const patientAge = birthDate ? calculateAge(birthDate) : null;
    const circleName = getFormField(formData, "circleName") || `Círculo de ${patientName}`;
    const medicalCondition = getFormField(formData, "medicalCondition");

    if (!patientName || !birthDate || patientAge === null || !circleName) {
      return actionError("Completá el nombre y una fecha de nacimiento válida.");
    }

    const careCircle = await prisma.careCircle.create({
      data: {
        name: circleName,
        patient: {
          create: {
            name: patientName,
            age: patientAge,
            birthDate,
            medicalCondition: medicalCondition || null,
          },
        },
        members: { create: { userId: user.id, role: "ADMIN" } },
        documentFolders: {
          create: DEFAULT_DOCUMENT_FOLDERS.map((folder) => ({
            ...folder,
            locationKey: getFolderLocationKey(null, folder.name),
          })),
        },
      },
      select: { id: true },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "CARE_CIRCLE_CREATED",
      message: `${user.name} creó el círculo de cuidado.`,
    });

    await setActiveCareCircleId(careCircle.id);
    revalidatePath("/app");
  } catch (error) {
    return unexpectedActionError("createCareCircleAction", error);
  }

  redirect("/app");
}

export async function updatePatientAction(_previousState, formData) {
  try {
    const { user, careCircle, patient, canManage } = await requireCareContext();
    const name = getFormField(formData, "name");
    const birthDateValue = getFormField(formData, "birthDate");
    const birthDate = parseDateInput(birthDateValue);
    const age = birthDate ? calculateAge(birthDate) : null;
    const medicalCondition = getFormField(formData, "medicalCondition");
    const importantNotes = getFormField(formData, "importantNotes");

    if (!careCircle || !patient || !canManage) {
      return actionError("No tenés permisos para editar los datos del paciente.");
    }
    if (!name || !birthDate || age === null) {
      return actionError("Completá el nombre y una fecha de nacimiento válida.");
    }

    await prisma.$transaction([
      prisma.patient.update({
        where: { id: patient.id },
        data: {
          name,
          age,
          birthDate,
          medicalCondition: medicalCondition || null,
          importantNotes: importantNotes || null,
        },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "PATIENT_UPDATED",
          message: `${user.name} actualizó los datos de ${name}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    return actionSuccess("Datos del paciente actualizados.");
  } catch (error) {
    return unexpectedActionError("updatePatientAction", error);
  }
}
