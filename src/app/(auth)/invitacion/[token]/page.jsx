import Image from "next/image";
import { notFound } from "next/navigation";
import { acceptInvitationAction } from "@/features/team/actions";
import { prisma } from "@/services/db";
import { PasswordField } from "@/components/password-field";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { StatusToast } from "@/components/status-toast";
import { Card, Field, inputClassName } from "@/components/ui";

export default async function InvitationPage({ params }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) {
    notFound();
  }

  const invitation = await prisma.careInvitation.findUnique({
    where: { token },
    include: {
      careCircle: {
        include: {
          patient: true,
        },
      },
    },
  });

  if (!invitation) {
    notFound();
  }

  const isExpired = invitation.expiresAt < new Date();
  const isAccepted = Boolean(invitation.acceptedAt);
  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true, name: true },
  });

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-full max-w-xl p-6 sm:p-8">
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
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
              Invitación
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Sumarte a {invitation.careCircle.name}
            </h1>
          </div>
        </div>

        {isAccepted || isExpired ? (
          <div className="rounded-2xl bg-[#fff4de] p-5">
            <StatusToast
              message={
                isAccepted
                  ? "Esta invitación ya fue utilizada."
                  : "Esta invitación venció."
              }
              status="warning"
            />
            <p className="font-semibold text-[color:var(--care-warning)]">
              {isAccepted
                ? "Esta invitación ya fue utilizada."
                : "Esta invitación expiró."}
            </p>
            <a
              href="/login"
              className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--care-ink)]"
            >
              Ir a iniciar sesión
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl bg-[#f8fbfd] p-5">
              <p className="font-semibold text-[color:var(--care-ink)]">
                Te invitaron como{" "}
                {invitation.role === "OBSERVER" ? "observador" : "cuidador"}.
              </p>
              <p className="mt-2 text-sm text-[color:var(--care-muted)]">
                Email: {invitation.email}
              </p>
              {existingUser ? (
                <p className="mt-2 text-sm font-semibold text-[color:var(--care-ink-soft)]">
                  Ya existe una cuenta con este email. Ingresá tu contraseña
                  actual para sumar este círculo a tu cuenta.
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-[color:var(--care-ink-soft)]">
                  Creá tu cuenta para aceptar la invitación.
                </p>
              )}
              {invitation.careCircle.patient ? (
                <p className="mt-1 text-sm text-[color:var(--care-muted)]">
                  Persona cuidada: {invitation.careCircle.patient.name}
                </p>
              ) : null}
            </div>

            <ToastForm action={acceptInvitationAction} className="grid gap-4">
              <input type="hidden" name="token" value={token} />
              <Field label="Nombre completo">
                <input
                  className={inputClassName}
                  name="name"
                  defaultValue={existingUser?.name || invitation.name || ""}
                  readOnly={Boolean(existingUser)}
                  required={!existingUser}
                />
              </Field>
              <Field
                label={
                  existingUser ? "Contraseña de tu cuenta" : "Crear contraseña"
                }
                htmlFor="invitation-password"
              >
                <PasswordField
                  id="invitation-password"
                  name="password"
                  autoComplete={
                    existingUser ? "current-password" : "new-password"
                  }
                  minLength={existingUser ? undefined : 8}
                  maxLength={128}
                  required
                />
              </Field>
              <SubmitButton pendingLabel="Aceptando…">
                Aceptar invitación
              </SubmitButton>
            </ToastForm>
          </>
        )}
      </Card>
    </main>
  );
}
