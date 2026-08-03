"use client";

import { EditModal } from "@/components/edit-modal";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateFolderAction } from "@/features/documents/actions";

export function FolderEditButton({ folder }) {
  return (
    <EditModal eyebrow="Documentos" title={`Renombrar ${folder.name}`}>
      {(close) => (
        <ToastForm
          action={updateFolderAction}
          className="grid gap-4"
          onSuccess={close}
          refreshOnSuccess
          showStatus
        >
          <input name="folderId" type="hidden" value={folder.id} />
          <Field label="Nombre de la carpeta">
            <input
              autoComplete="off"
              className={inputClassName}
              defaultValue={folder.name}
              maxLength={80}
              name="name"
              required
            />
          </Field>
          <SubmitButton pendingLabel="Guardando…">Guardar nombre</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
