"use client";

import { EditModal } from "@/components/edit-modal";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateDocumentAction } from "@/features/documents/actions";

export function DocumentEditButton({ document }) {
  return (
    <EditModal eyebrow="Documentos" title={`Editar ${document.title}`}>
      {(close) => (
        <ToastForm action={updateDocumentAction} className="grid gap-4" onSuccess={close}>
          <input name="documentId" type="hidden" value={document.id} />
          <Field label="Título">
            <input className={inputClassName} defaultValue={document.title} name="title" required />
          </Field>
          <Field label="Notas">
            <textarea
              className={inputClassName}
              defaultValue={document.notes || ""}
              name="notes"
              rows={4}
            />
          </Field>
          <p className="text-sm text-[color:var(--care-muted)]">
            Para reemplazar el archivo, eliminá este documento y subí uno nuevo.
          </p>
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
