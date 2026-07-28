"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { initialActionState } from "@/utils/action-result";

export function CareCircleSwitcher({
  action,
  careCircles,
  activeCareCircleId,
  className = "hidden sm:block",
}) {
  const formRef = useRef(null);
  const lastToastId = useRef(null);
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (!state?.id || state.id === lastToastId.current) {
      return;
    }

    lastToastId.current = state.id;
    toast.error(state.message);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      <label className="sr-only" htmlFor="careCircleId">
        Cambiar círculo de cuidado
      </label>
      <select
        id="careCircleId"
        name="careCircleId"
        defaultValue={activeCareCircleId || ""}
        className="min-h-10 w-full rounded-full border border-[color:var(--care-cloud)] bg-white px-4 text-sm font-semibold text-[color:var(--care-ink)]"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {careCircles.map((careCircle) => (
          <option key={careCircle.id} value={careCircle.id}>
            {careCircle.name}
          </option>
        ))}
      </select>
    </form>
  );
}
