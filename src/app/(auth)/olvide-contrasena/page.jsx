import Image from "next/image";
import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { Card, Field, SecondaryLink, inputClassName } from "@/components/ui";

export const metadata = {
  title: "Recuperar contraseña | Cuida",
};

export default function ForgotPasswordPage() {
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
              Recuperar contraseña
            </h1>
            <p className="text-sm text-[color:var(--care-muted)]">
              Te enviaremos un enlace seguro si el email está registrado.
            </p>
          </div>
        </div>

        <ToastForm action={requestPasswordResetAction} className="grid gap-4">
          <Field label="Email">
            <input
              className={inputClassName}
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </Field>
          <SubmitButton pendingLabel="Enviando…" className="mt-2 w-full">
            Enviar enlace
          </SubmitButton>
        </ToastForm>

        <div className="mt-6 text-center">
          <SecondaryLink href="/login">Volver a iniciar sesión</SecondaryLink>
        </div>
      </Card>
    </main>
  );
}
