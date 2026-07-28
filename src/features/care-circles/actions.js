"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { requireUser, setActiveCareCircleId } from "@/services/auth";
import { createActivity } from "@/services/activity";
import { actionError, unexpectedActionError } from "@/utils/action-result";
import { getFormField } from "@/utils/form-data";

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
    const patientAge = Number(getFormField(formData, "patientAge"));
    const circleName = getFormField(formData, "circleName") || `Círculo de ${patientName}`;
    const medicalCondition = getFormField(formData, "medicalCondition");

    if (!patientName || patientAge < 1 || !circleName) {
      return actionError("Completá el nombre de la persona cuidada y una edad válida.");
    }

    const careCircle = await prisma.careCircle.create({
      data: {
        name: circleName,
        patient: {
          create: {
            name: patientName,
            age: patientAge,
            medicalCondition: medicalCondition || null,
          },
        },
        members: { create: { userId: user.id, role: "ADMIN" } },
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
