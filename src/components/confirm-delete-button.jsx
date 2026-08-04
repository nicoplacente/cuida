import { ConfirmationButton } from "@/components/confirmation-button";

export function ConfirmDeleteButton({ action, description, fields, title }) {
  return (
    <ConfirmationButton
      action={action}
      confirmLabel="Eliminar definitivamente"
      description={description}
      eyebrow="Confirmar eliminación"
      fields={fields}
      pendingLabel="Eliminando…"
      title={title}
      triggerLabel="Eliminar"
    />
  );
}
