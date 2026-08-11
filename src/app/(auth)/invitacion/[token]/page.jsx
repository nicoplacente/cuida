import Image from "next/image";
import {
  acceptInvitationAction,
  loginWithInvitationAction,
  registerWithInvitationAction,
} from "@/features/team/actions";
import { getCurrentUser } from "@/services/auth";
import { prisma } from "@/services/db";
import { InvitationAuthForms } from "@/components/invitation-auth-forms";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { Badge, Card } from "@/components/ui";
import { formatShortDate, formatTime } from "@/utils/dates";
import {
  getInvitationRoleLabel,
  isInvitationExpired,
  isValidInvitationToken,
} from "@/utils/invitations";

function UnavailableInvitation({ expired = false }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-[min(100%,36rem)] p-6 sm:p-8">
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
              Invitación no disponible
            </h1>
          </div>
        </div>

        <div className="rounded-2xl bg-[#fff4de] p-5">
          <p className="font-semibold text-[color:var(--care-warning)]" role="alert">
            {expired
              ? "El enlace de invitación venció."
              : "El enlace de invitación no es válido o fue cancelado."}
          </p>
          <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
            Pedí a quien administra el círculo de cuidado que genere un nuevo enlace.
          </p>
          <a
            href="/login"
            className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--care-ink)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </Card>
    </main>
  );
}

function InvitationSummary({ invitation, roleLabel }) {
  return (
    <div className="rounded-2xl border border-[color:var(--care-cloud)] bg-[color:var(--care-canvas)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[color:var(--care-muted)]">
            Grupo de cuidado
          </p>
          <p className="mt-1 text-lg font-semibold text-[color:var(--care-ink)]">
            {invitation.careCircle.name}
          </p>
        </div>
        <Badge tone="teal">{roleLabel}</Badge>
      </div>
      {invitation.careCircle.patient ? (
        <p className="mt-3 text-sm text-[color:var(--care-ink-soft)]">
          Persona cuidada: {invitation.careCircle.patient.name}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-semibold text-[color:var(--care-warning)]">
        El enlace vence el {formatShortDate(invitation.expiresAt)} a las{" "}
        {formatTime(invitation.expiresAt)}.
      </p>
    </div>
  );
}

export default async function InvitationPage({ params }) {
  const { token } = await params;
  if (!isValidInvitationToken(token)) {
    return <UnavailableInvitation />;
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
    return <UnavailableInvitation />;
  }
  if (isInvitationExpired(invitation.expiresAt)) {
    return <UnavailableInvitation expired />;
  }

  const currentUser = await getCurrentUser();
  const roleLabel = getInvitationRoleLabel(invitation.role);

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-[min(100%,42rem)] p-6 sm:p-8">
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
              Invitación al equipo
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Sumarte a {invitation.careCircle.name}
            </h1>
          </div>
        </div>

        <InvitationSummary invitation={invitation} roleLabel={roleLabel} />

        {currentUser ? (
          <div className="mt-6 rounded-2xl border border-[color:var(--care-cloud)] p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Continuar con tu cuenta</h2>
            <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
              Vas a ingresar como {currentUser.name} ({currentUser.email}). Si ya
              pertenecés al grupo, tu rol actual no cambiará.
            </p>
            <ToastForm action={acceptInvitationAction} className="mt-5" showStatus>
              <input type="hidden" name="token" value={token} />
              <SubmitButton pendingLabel="Ingresando…" className="w-full sm:w-auto">
                Ingresar al grupo
              </SubmitButton>
            </ToastForm>
          </div>
        ) : (
          <InvitationAuthForms
            loginAction={loginWithInvitationAction}
            registerAction={registerWithInvitationAction}
            token={token}
          />
        )}
      </Card>
    </main>
  );
}
