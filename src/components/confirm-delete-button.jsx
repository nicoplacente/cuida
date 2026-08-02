"use client";

import { EditModal } from "@/components/edit-modal";
import { SecondarySubmitButton, ToastForm } from "@/components/toast-form";

export function ConfirmDeleteButton({ action, description, fields, title }) {
  return (
    <EditModal
      eyebrow="Confirmar eliminación"
      title={title}
      triggerLabel="Eliminar"
      triggerTone="danger"
    >
      {(close) => (
        <div className="grid gap-6">
          <p className="text-[color:var(--care-ink-soft)]">{description}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--care-teal)]"
              onClick={close}
              type="button"
            >
              Cancelar
            </button>
            <ToastForm action={action} onSuccess={close}>
              {Object.entries(fields).map(([name, value]) => (
                <input key={name} name={name} type="hidden" value={value} />
              ))}
              <SecondarySubmitButton pendingLabel="Eliminando…" tone="danger">
                Eliminar definitivamente
              </SecondarySubmitButton>
            </ToastForm>
          </div>
        </div>
      )}
    </EditModal>
  );
}
