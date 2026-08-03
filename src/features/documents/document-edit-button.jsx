"use client";

import { EditModal } from "@/components/edit-modal";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateDocumentAction } from "@/features/documents/actions";

export function DocumentEditButton({ document, folderOptions }) {
  return (
    <EditModal eyebrow="Documentos" title={`Editar ${document.title}`}>
      {(close) => (
        <ToastForm
          action={updateDocumentAction}
          className="grid gap-4"
          onSuccess={close}
          refreshOnSuccess
          showStatus
        >
          <input name="documentId" type="hidden" value={document.id} />
          <Field label="Título">
            <input
              className={inputClassName}
              defaultValue={document.title}
              maxLength={120}
              name="title"
              required
            />
          </Field>
          <Field label="Guardar en">
            <select
              className={inputClassName}
              defaultValue={document.folderId || ""}
              name="folderId"
            >
              <option value="">Documentos (raíz)</option>
              {folderOptions.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notas">
            <textarea
              className={inputClassName}
              defaultValue={document.notes || ""}
              maxLength={2000}
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
