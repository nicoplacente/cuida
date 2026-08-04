"use client";

import { EditModal } from "@/components/edit-modal";
import { SecondarySubmitButton, ToastForm } from "@/components/toast-form";

export function ConfirmationButton({
  action,
  confirmLabel,
  description,
  disabled = false,
  eyebrow = "Confirmar acción",
  fields = {},
  pendingLabel = "Procesando…",
  title,
  triggerLabel,
  triggerTitle,
  triggerTone = "danger",
}) {
  return (
    <EditModal
      eyebrow={eyebrow}
      title={title}
      triggerDisabled={disabled}
      triggerLabel={triggerLabel}
      triggerTitle={triggerTitle}
      triggerTone={triggerTone}
    >
      {(close) => (
        <div className="grid gap-6">
          <p className="text-[color:var(--care-ink-soft)]">{description}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={close}
              type="button"
            >
              Cancelar
            </button>
            <ToastForm action={action} onSuccess={close}>
              {Object.entries(fields).map(([name, value]) => (
                <input key={name} name={name} type="hidden" value={value} />
              ))}
              <SecondarySubmitButton pendingLabel={pendingLabel} tone="danger">
                {confirmLabel}
              </SecondarySubmitButton>
            </ToastForm>
          </div>
        </div>
      )}
    </EditModal>
  );
}
