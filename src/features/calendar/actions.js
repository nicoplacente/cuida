"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { actionError, actionSuccess, unexpectedActionError } from "@/utils/action-result";
import { getFormField, isValidTimeInput, parseDateInput } from "@/utils/form-data";
import { parseReminderMinutes } from "@/utils/reminders";

export async function createEventAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const title = getFormField(formData, "title");
    const date = getFormField(formData, "date");
    const time = getFormField(formData, "time");
    const location = getFormField(formData, "location");
    const notes = getFormField(formData, "notes");
    const reminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );

    if (!careCircle || !title || !date || !time) {
      return actionError("Completá el título, la fecha y el horario del evento.");
    }
    if (!isValidTimeInput(time)) {
      return actionError("Ingresá un horario válido para el evento.");
    }
    if (reminderMinutes === null) {
      return actionError("Seleccioná una anticipación válida.");
    }

    const eventDate = parseDateInput(date);
    if (!eventDate) {
      return actionError("Ingresá una fecha válida.");
    }

    await prisma.calendarEvent.create({
      data: {
        careCircleId: careCircle.id,
        title,
        date: eventDate,
        time,
        reminderMinutes,
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
    return actionSuccess("Evento creado correctamente.");
  } catch (error) {
    return unexpectedActionError("createEventAction", error);
  }
}

export async function updateEventAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const eventId = getFormField(formData, "eventId");
    const title = getFormField(formData, "title");
    const date = getFormField(formData, "date");
    const time = getFormField(formData, "time");
    const location = getFormField(formData, "location");
    const notes = getFormField(formData, "notes");
    const reminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );
    const eventDate = parseDateInput(date);

    if (!careCircle || !eventId || !title || !date || !time) {
      return actionError("Revisá los datos del evento.");
    }
    if (!eventDate) {
      return actionError("Ingresá una fecha válida.");
    }
    if (!isValidTimeInput(time)) {
      return actionError("Ingresá un horario válido para el evento.");
    }
    if (reminderMinutes === null) {
      return actionError("Seleccioná una anticipación válida.");
    }

    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, careCircleId: careCircle.id },
      select: { id: true },
    });

    if (!event) {
      return actionError("El evento no está disponible.");
    }

    await prisma.$transaction([
      prisma.calendarEvent.update({
        where: { id: eventId },
        data: {
          title,
          date: eventDate,
          time,
          reminderMinutes,
          location: location || null,
          notes: notes || null,
        },
      }),
      prisma.notification.deleteMany({
        where: { type: "EVENT", sourceId: eventId, sentAt: null },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "EVENT_UPDATED",
          message: `${user.name} actualizó el evento ${title}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/calendario");
    return actionSuccess("Evento actualizado correctamente.");
  } catch (error) {
    return unexpectedActionError("updateEventAction", error);
  }
}
