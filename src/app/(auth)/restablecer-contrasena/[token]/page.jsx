import Image from "next/image";
import { resetPasswordAction } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/password-field";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { StatusToast } from "@/components/status-toast";
import { Card, Field, SecondaryLink } from "@/components/ui";
import { prisma } from "@/services/db";
import {
  hashPasswordResetToken,
  isValidPasswordResetToken,
} from "@/utils/password-reset";

export const metadata = {
  title: "Crear nueva contraseña",
};

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  const resetToken = isValidPasswordResetToken(token)
    ? await prisma.passwordResetToken.findFirst({
        where: {
          tokenHash: hashPasswordResetToken(token),
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      })
    : null;
  const isValid = Boolean(resetToken);

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
              Crear nueva contraseña
            </h1>
            <p className="text-sm text-[color:var(--care-muted)]">
              Elegí una contraseña de al menos 8 caracteres.
            </p>
          </div>
        </div>

        {isValid ? (
          <ToastForm action={resetPasswordAction} className="grid gap-4">
            <input type="hidden" name="token" value={token} />
            <Field label="Nueva contraseña" htmlFor="new-password">
              <PasswordField
                id="new-password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </Field>
            <Field label="Confirmar nueva contraseña" htmlFor="new-password-confirmation">
              <PasswordField
                id="new-password-confirmation"
                name="passwordConfirmation"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </Field>
            <SubmitButton pendingLabel="Actualizando…" className="mt-2 w-full">
              Actualizar contraseña
            </SubmitButton>
          </ToastForm>
        ) : (
          <>
            <StatusToast message="El enlace no es válido o ya venció. Solicitá uno nuevo." />
            <p className="rounded-2xl bg-[color:var(--care-canvas)] p-4 text-sm text-[color:var(--care-ink-soft)]">
              Para proteger tu cuenta, necesitás solicitar un nuevo enlace de recuperación.
            </p>
          </>
        )}

        <div className="mt-6 grid gap-3 text-center">
          {!isValid ? (
            <SecondaryLink href="/olvide-contrasena">Solicitar otro enlace</SecondaryLink>
          ) : null}
          <SecondaryLink href="/login">Ir a iniciar sesión</SecondaryLink>
        </div>
      </Card>
    </main>
  );
}
