"use client";

import { EditModal } from "@/components/edit-modal";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import {
  createFolderAction,
  uploadDocumentAction,
} from "@/features/documents/actions";

export function DocumentLibraryActions({ currentFolderId = "", currentFolderName = "Documentos" }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <EditModal
        eyebrow="Organizar documentos"
        title={`Nueva carpeta en ${currentFolderName}`}
        triggerClassName="min-h-11"
        triggerLabel="Nueva carpeta"
      >
        {(close) => (
          <ToastForm
            action={createFolderAction}
            className="grid gap-4"
            onSuccess={close}
            refreshOnSuccess
            showStatus
          >
            <input name="parentId" type="hidden" value={currentFolderId} />
            <Field label="Nombre de la carpeta">
              <input
                autoComplete="off"
                autoFocus
                className={inputClassName}
                maxLength={80}
                name="name"
                placeholder="Por ejemplo, Estudios cardíacos"
                required
              />
            </Field>
            <p className="text-sm text-[color:var(--care-muted)]">
              Después podés abrirla para crear subcarpetas o subir documentos.
            </p>
            <SubmitButton pendingLabel="Creando carpeta…">Crear carpeta</SubmitButton>
          </ToastForm>
        )}
      </EditModal>

      <EditModal
        eyebrow="Documentos protegidos"
        title={`Subir en ${currentFolderName}`}
        triggerClassName="min-h-11"
        triggerLabel="Subir documento"
        triggerTone="primary"
      >
        {(close) => (
          <ToastForm
            action={uploadDocumentAction}
            className="grid gap-4"
            onSuccess={close}
            refreshOnSuccess
            resetOnSuccess
            showStatus
          >
            <input name="folderId" type="hidden" value={currentFolderId} />
            <Field label="Título">
              <input className={inputClassName} maxLength={120} name="title" required />
            </Field>
            <Field label="Archivo">
              <input
                aria-describedby="document-file-help"
                className={inputClassName}
                type="file"
                name="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                required
              />
              <span
                id="document-file-help"
                className="text-sm font-normal text-[color:var(--care-muted)]"
              >
                PDF, imágenes o documentos Word. Tamaño máximo: 8 MB.
              </span>
            </Field>
            <Field label="Notas">
              <textarea className={inputClassName} maxLength={2000} name="notes" rows={4} />
            </Field>
            <SubmitButton pendingLabel="Subiendo…">Subir documento</SubmitButton>
          </ToastForm>
        )}
      </EditModal>
    </div>
  );
}
