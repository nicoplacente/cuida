"use client";

import { EditModal } from "@/components/edit-modal";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateLogAction } from "@/features/timeline/actions";

export function LogEditButton({ log, logTypes }) {
  return (
    <EditModal eyebrow="Historial diario" title="Editar registro">
      {(close) => (
        <ToastForm action={updateLogAction} className="grid gap-4" onSuccess={close}>
          <input name="logId" type="hidden" value={log.id} />
          <Field label="Tipo">
            <select className={inputClassName} defaultValue={log.type} name="type">
              {logTypes.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Fecha y hora">
            <input
              className={inputClassName}
              defaultValue={log.occurredAt}
              name="occurredAt"
              required
              type="datetime-local"
            />
          </Field>
          <Field label="Detalle">
            <textarea className={inputClassName} defaultValue={log.content} name="content" rows={6} required />
          </Field>
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
