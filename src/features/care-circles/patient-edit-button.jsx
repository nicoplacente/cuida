"use client";

import { EditModal } from "@/components/edit-modal";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updatePatientAction } from "@/features/care-circles/actions";

export function PatientEditButton({ careCircleName, patient }) {
  return (
    <EditModal eyebrow="Paciente asociado" title={`Editar datos de ${patient.name}`}>
      {(close) => (
        <ToastForm action={updatePatientAction} className="grid gap-4" onSuccess={close}>
          <Field label="Nombre del círculo de cuidado">
            <input
              className={inputClassName}
              defaultValue={careCircleName}
              name="circleName"
              required
            />
          </Field>
          <Field label="Nombre">
            <input className={inputClassName} defaultValue={patient.name} name="name" required />
          </Field>
          <Field label="Fecha de nacimiento">
            <input
              className={inputClassName}
              defaultValue={patient.birthDate || ""}
              name="birthDate"
              required
              type="date"
            />
          </Field>
          <Field label="Condición médica opcional">
            <input
              className={inputClassName}
              defaultValue={patient.medicalCondition || ""}
              name="medicalCondition"
            />
          </Field>
          <Field label="Notas importantes">
            <textarea
              className={inputClassName}
              defaultValue={patient.importantNotes || ""}
              name="importantNotes"
              rows={4}
            />
          </Field>
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
