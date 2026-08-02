"use client";

import { EditModal } from "@/components/edit-modal";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateMedicationAction } from "@/features/medications/actions";
import { MedicationFormFields } from "@/features/medications/medication-form-fields";

export function MedicationEditButton({ medication }) {
  return (
    <EditModal eyebrow="Medicación" title={`Editar ${medication.name}`}>
      {(close) => (
        <ToastForm action={updateMedicationAction} className="grid gap-4" onSuccess={close}>
          <input name="medicationId" type="hidden" value={medication.id} />
          <MedicationFormFields medication={medication} />
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
