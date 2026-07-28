"use client";

import { EditModal } from "@/components/edit-modal";
import { ReminderField } from "@/components/reminder-field";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateEventAction } from "@/features/calendar/actions";

export function EventEditButton({ event }) {
  return (
    <EditModal eyebrow="Calendario" title={`Editar ${event.title}`}>
      {(close) => (
        <ToastForm action={updateEventAction} className="grid gap-4" onSuccess={close}>
          <input name="eventId" type="hidden" value={event.id} />
          <Field label="Título">
            <input
              className={inputClassName}
              defaultValue={event.title}
              name="title"
              required
            />
          </Field>
          <Field label="Fecha">
            <input
              className={inputClassName}
              defaultValue={event.date}
              name="date"
              required
              type="date"
            />
          </Field>
          <Field label="Hora">
            <input
              className={inputClassName}
              defaultValue={event.time}
              name="time"
              required
              type="time"
            />
          </Field>
          <ReminderField defaultValue={event.reminderMinutes} />
          <Field label="Ubicación">
            <input
              className={inputClassName}
              defaultValue={event.location || ""}
              name="location"
            />
          </Field>
          <Field label="Notas">
            <textarea
              className={inputClassName}
              defaultValue={event.notes || ""}
              name="notes"
              rows={4}
            />
          </Field>
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
