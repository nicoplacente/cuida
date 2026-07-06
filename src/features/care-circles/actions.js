"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { requireUser, setActiveCareCircleId } from "@/services/auth";
import { createActivity } from "@/services/activity";

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

export async function switchCareCircleAction(formData) {
  const user = await requireUser();
  const careCircleId = getField(formData, "careCircleId");

  const membership = await prisma.careCircleMember.findUnique({
    where: {
      userId_careCircleId: {
        userId: user.id,
        careCircleId,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    redirect("/app?error=No tenés acceso a ese círculo de cuidado.");
  }

  await setActiveCareCircleId(careCircleId);
  revalidatePath("/app");
  redirect("/app");
}

export async function createCareCircleAction(formData) {
  const user = await requireUser();
  const patientName = getField(formData, "patientName");
  const patientAge = Number(getField(formData, "patientAge"));
  const circleName = getField(formData, "circleName") || `Círculo de ${patientName}`;
  const medicalCondition = getField(formData, "medicalCondition");

  if (!patientName || !patientAge || patientAge < 1 || !circleName) {
    redirect(
      "/app/circulos/nuevo?error=Completá el nombre de la persona cuidada y una edad válida.",
    );
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
      members: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
    select: {
      id: true,
    },
  });

  await createActivity({
    careCircleId: careCircle.id,
    userId: user.id,
    type: "CARE_CIRCLE_CREATED",
    message: `${user.name} creó el círculo de cuidado.`,
  });

  await setActiveCareCircleId(careCircle.id);
  revalidatePath("/app");
  redirect("/app");
}
