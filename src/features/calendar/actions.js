"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

export async function createEventAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const title = getField(formData, "title");
  const date = getField(formData, "date");
  const time = getField(formData, "time");
  const location = getField(formData, "location");
  const notes = getField(formData, "notes");

  if (!careCircle || !title || !date || !time) {
    return;
  }

  await prisma.calendarEvent.create({
    data: {
      careCircleId: careCircle.id,
      title,
      date: new Date(`${date}T00:00:00`),
      time,
      location: location || null,
      notes: notes || null,
    },
  });

  await createActivity({
    careCircleId: careCircle.id,
    userId: user.id,
    type: "EVENT_CREATED",
    message: `${user.name} creó el evento ${title}.`,
  });

  revalidatePath("/app");
  revalidatePath("/app/calendario");
}
