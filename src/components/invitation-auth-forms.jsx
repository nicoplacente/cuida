"use client";

import { useRef, useState } from "react";
import { PasswordField } from "@/components/password-field";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { Field, inputClassName } from "@/components/ui";

function InvitationLoginForm({ action, token }) {
  return (
    <ToastForm action={action} className="mt-5 grid gap-4" showStatus>
      <input type="hidden" name="token" value={token} />
      <Field label="Email" htmlFor="invitation-login-email">
        <input
          id="invitation-login-email"
          className={inputClassName}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Contraseña" htmlFor="invitation-login-password">
        <PasswordField
          id="invitation-login-password"
          name="password"
          autoComplete="current-password"
          maxLength={128}
          required
        />
      </Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--care-cloud)] bg-[color:var(--care-canvas)] px-4 py-3 transition hover:border-[color:var(--care-teal)]">
        <input
          className="mt-0.5 size-5 shrink-0 accent-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--care-teal)]"
          name="rememberSession"
          type="checkbox"
        />
        <span className="text-sm font-semibold">Mantener mi sesión iniciada</span>
      </label>
      <SubmitButton pendingLabel="Ingresando…" className="w-full">
        Ingresar y sumarme
      </SubmitButton>
    </ToastForm>
  );
}

function InvitationRegisterForm({ action, token }) {
  return (
    <ToastForm action={action} className="mt-5 grid gap-4" showStatus>
      <input type="hidden" name="token" value={token} />
      <Field label="Nombre completo" htmlFor="invitation-register-name">
        <input
          id="invitation-register-name"
          className={inputClassName}
          name="name"
          autoComplete="name"
          required
        />
      </Field>
      <Field label="Email" htmlFor="invitation-register-email">
        <input
          id="invitation-register-email"
          className={inputClassName}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Contraseña" htmlFor="invitation-register-password">
        <PasswordField
          id="invitation-register-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </Field>
      <SubmitButton pendingLabel="Creando cuenta…" className="w-full">
        Crear cuenta y sumarme
      </SubmitButton>
    </ToastForm>
  );
}

export function InvitationAuthForms({ loginAction, registerAction, token }) {
  const [mode, setMode] = useState("login");
  const headingRef = useRef(null);
  const isLogin = mode === "login";

  function switchMode(nextMode) {
    setMode(nextMode);
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <section
      className="mt-6 rounded-2xl border border-[color:var(--care-cloud)] p-5 sm:p-6"
      key={mode}
    >
      <h2
        className="text-xl font-semibold focus:outline-none"
        ref={headingRef}
        tabIndex={-1}
      >
        {isLogin ? "Iniciar sesión" : "Crear una cuenta"}
      </h2>
      <p className="mt-2 text-sm text-[color:var(--care-muted)]">
        {isLogin
          ? "Ingresá con tu cuenta y el grupo se agregará automáticamente."
          : "Registrate y entrarás directamente a este grupo."}
      </p>

      {isLogin ? (
        <InvitationLoginForm action={loginAction} token={token} />
      ) : (
        <InvitationRegisterForm action={registerAction} token={token} />
      )}

      <div className="mt-6 border-t border-[color:var(--care-cloud)] pt-5 text-center">
        <p className="text-sm text-[color:var(--care-ink-soft)]">
          {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}
        </p>
        <button
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white px-5 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--care-teal)]"
          onClick={() => switchMode(isLogin ? "register" : "login")}
          type="button"
        >
          {isLogin ? "Crear una cuenta" : "Volver a iniciar sesión"}
        </button>
      </div>
    </section>
  );
}
