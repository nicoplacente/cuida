"use client";

import { EditModal } from "@/components/edit-modal";
import { ReminderField } from "@/components/reminder-field";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateMedicationAction } from "@/features/medications/actions";

export function MedicationEditButton({ medication }) {
  return (
    <EditModal eyebrow="Medicación" title={`Editar ${medication.name}`}>
      {(close) => (
        <ToastForm
          action={updateMedicationAction}
          className="grid gap-4"
          onSuccess={close}
        >
          <input name="medicationId" type="hidden" value={medication.id} />
          <Field label="Nombre">
            <input
              className={inputClassName}
              defaultValue={medication.name}
              name="name"
              required
            />
          </Field>
          <Field label="Dosis">
            <input
              className={inputClassName}
              defaultValue={medication.dose}
              name="dose"
              required
            />
          </Field>
          <Field label="Horario">
            <input
              className={inputClassName}
              defaultValue={medication.schedule}
              name="schedule"
              required
              type="time"
            />
          </Field>
          <ReminderField defaultValue={medication.reminderMinutes} />
          <Field label="Frecuencia">
            <input
              className={inputClassName}
              defaultValue={medication.frequency}
              name="frequency"
              required
            />
          </Field>
          <Field label="Instrucciones">
            <textarea
              className={inputClassName}
              defaultValue={medication.instructions || ""}
              name="instructions"
              rows={4}
            />
          </Field>
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
