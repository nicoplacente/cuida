"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField, isValidTimeInput, parseDateInput } from "@/utils/form-data";
import { parseReminderMinutes } from "@/utils/reminders";
import { unexpectedActionError } from "@/utils/server-action-result";

export async function createEventAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const title = getFormField(formData, "title");
    const date = getFormField(formData, "date");
    const time = getFormField(formData, "time");
    const location = getFormField(formData, "location");
    const notes = getFormField(formData, "notes");
    const reminderMinutes = parseReminderMinutes(
      getFormField(formData, "reminderMinutes"),
    );

    if (!careCircle || !canManage || !title || !date || !time) {
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
    const { user, careCircle, canManage } = await requireCareContext();
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

    if (!careCircle || !canManage || !eventId || !title || !date || !time) {
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

export async function completeEventAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const eventId = getFormField(formData, "eventId");
    if (!careCircle || !canManage || !eventId) {
      return actionError("No tenés permisos para completar este evento.");
    }

    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, careCircleId: careCircle.id, completed: false },
      select: { title: true },
    });
    if (!event) return actionError("El evento ya fue realizado o no está disponible.");

    await prisma.$transaction([
      prisma.calendarEvent.update({
        where: { id: eventId },
        data: { completed: true, completedAt: new Date(), completedById: user.id },
      }),
      prisma.notification.deleteMany({
        where: { type: "EVENT", sourceId: eventId, sentAt: null },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "EVENT_COMPLETED",
          message: `${user.name} marcó como realizado el evento ${event.title}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/calendario");
    return actionSuccess("Evento marcado como realizado.");
  } catch (error) {
    return unexpectedActionError("completeEventAction", error);
  }
}

export async function deleteEventAction(_previousState, formData) {
  try {
    const { user, careCircle, canManage } = await requireCareContext();
    const eventId = getFormField(formData, "eventId");
    if (!careCircle || !canManage || !eventId) {
      return actionError("No tenés permisos para eliminar este evento.");
    }

    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, careCircleId: careCircle.id },
      select: { title: true },
    });
    if (!event) return actionError("El evento no está disponible.");

    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { type: "EVENT", sourceId: eventId } }),
      prisma.calendarEvent.delete({ where: { id: eventId } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "EVENT_DELETED",
          message: `${user.name} eliminó el evento ${event.title}.`,
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/calendario");
    return actionSuccess("Evento eliminado.");
  } catch (error) {
    return unexpectedActionError("deleteEventAction", error);
  }
}
