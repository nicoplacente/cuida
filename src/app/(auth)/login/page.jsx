import Image from "next/image";
import { loginAction } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/password-field";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { Card, Field, LinkButton, inputClassName } from "@/components/ui";

export default async function LoginPage({ searchParams }) {
  const reason = (await searchParams)?.reason;
  const sessionExpired = reason === "session-expired";

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/cuida.png"
            alt="Logo de Cuida"
            width={48}
            height={48}
            className="rounded-2xl"
            priority
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Ingresar a Cuida
            </h1>
            <p className="text-sm text-[color:var(--care-muted)]">
              Accedé con tu cuenta o una invitación aceptada.
            </p>
          </div>
        </div>

        {sessionExpired ? (
          <p
            className="mb-4 rounded-xl bg-[#fff4de] px-4 py-3 text-sm font-medium text-[color:var(--care-warning)]"
            role="status"
          >
            Tu sesión venció. Volvé a ingresar.
          </p>
        ) : null}

        <ToastForm action={loginAction} className="grid gap-4">
          <Field label="Email">
            <input
              className={inputClassName}
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Contraseña" htmlFor="login-password">
            <PasswordField
              id="login-password"
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
            <span>
              <span className="block text-sm font-semibold text-[color:var(--care-ink)]">
                Mantener mi sesión iniciada durante 90 días
              </span>
              <span className="mt-1 block text-xs font-normal text-[color:var(--care-muted)]">
                Usalo solo en un dispositivo personal.
              </span>
            </span>
          </label>
          <SubmitButton pendingLabel="Ingresando…" className="mt-2 w-full">
            Ingresar
          </SubmitButton>
        </ToastForm>

        <div className="mt-6 grid gap-3 text-center">
          <a
            href="/olvide-contrasena"
            className="text-sm font-semibold text-[color:var(--care-ink-soft)] underline decoration-[color:var(--care-teal)] underline-offset-4"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <a
            href="/registro"
            className="text-sm font-semibold text-[color:var(--care-ink)] underline decoration-[color:var(--care-teal)] underline-offset-4"
          >
            Crear una cuenta nueva
          </a>
          <LinkButton href="/" className="bg-white text-[color:var(--care-ink)]">
            Volver al inicio
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
