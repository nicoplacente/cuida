"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { initialActionState } from "@/utils/action-result";
import { PrimaryButton } from "@/components/ui";

export function ToastForm({
  action,
  children,
  className = "",
  onSuccess,
  refreshOnSuccess = false,
  resetOnSuccess = false,
  showStatus = false,
  ...props
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = useRef(null);
  const lastToastId = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!state?.id || state.id === lastToastId.current) {
      return;
    }

    lastToastId.current = state.id;
    if (state.status === "success") {
      toast.success(state.message);
      if (resetOnSuccess) {
        formRef.current?.reset();
      }
      if (refreshOnSuccess) {
        router.refresh();
      }
      onSuccess?.();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [onSuccess, refreshOnSuccess, resetOnSuccess, router, state]);

  return (
    <form action={formAction} className={className} ref={formRef} {...props}>
      {children}
      {showStatus && state?.id ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "success"
              ? "bg-[color:var(--care-teal-soft)] text-[color:var(--care-success)]"
              : "bg-[#fff1f0] text-[color:var(--care-danger)]"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Procesando…",
  className = "",
  ...props
}) {
  const { pending } = useFormStatus();

  return (
    <PrimaryButton disabled={pending} className={className} type="submit" {...props}>
      {pending ? pendingLabel : children}
    </PrimaryButton>
  );
}

export function SecondarySubmitButton({
  children,
  pendingLabel = "Procesando…",
  className = "",
  tone = "neutral",
}) {
  const { pending } = useFormStatus();
  const toneClassName =
    tone === "danger"
      ? "border-[#f3c7c2] text-[color:var(--care-danger)]"
      : "border-[color:var(--care-cloud)] text-[color:var(--care-ink)]";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full border bg-white px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--care-teal)] disabled:cursor-not-allowed disabled:opacity-60 ${toneClassName} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
