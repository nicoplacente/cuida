"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ShareInvitationModal } from "@/components/share-invitation-modal";
import { SubmitButton } from "@/components/toast-form";
import { Field, inputClassName } from "@/components/ui";
import { initialActionState } from "@/utils/action-result";

export function InvitationForm({ action }) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [dismissedStateId, setDismissedStateId] = useState(null);
  const lastToastId = useRef(null);
  const invitation =
    state.status === "success" && state.id !== dismissedStateId ? state.data : null;

  useEffect(() => {
    if (!state?.id || state.id === lastToastId.current) {
      return;
    }

    lastToastId.current = state.id;
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <>
      <form action={formAction} className="grid gap-4">
        <Field label="Nombre opcional">
          <input className={inputClassName} name="name" autoComplete="name" />
        </Field>
        <Field label="Email">
          <input className={inputClassName} type="email" name="email" autoComplete="email" required />
        </Field>
        <Field label="Rol">
          <select className={inputClassName} name="role" defaultValue="CAREGIVER">
            <option value="CAREGIVER">Cuidador</option>
            <option value="OBSERVER">Observador</option>
          </select>
        </Field>
        <SubmitButton pendingLabel="Creando…">Crear invitación</SubmitButton>
      </form>

      {invitation ? (
        <ShareInvitationModal
          invitation={invitation}
          onClose={() => setDismissedStateId(state.id)}
        />
      ) : null}
    </>
  );
}
