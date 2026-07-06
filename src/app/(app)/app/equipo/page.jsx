import { createInvitationAction } from "@/features/team/actions";
import { requireCareContext, getCareCircleMembers } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, PrimaryButton, inputClassName } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/copy-button";
import { formatShortDate } from "@/utils/dates";
import { getAppUrl } from "@/utils/app-url";

const roleLabels = {
  ADMIN: "Administrador",
  CAREGIVER: "Cuidador",
  OBSERVER: "Observador",
};

export default async function TeamPage({ searchParams }) {
  const { user, careCircle } = await requireCareContext();
  const params = await searchParams;

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const [members, invitations, currentMembership] = await Promise.all([
    getCareCircleMembers(careCircle.id),
    prisma.careInvitation.findMany({
      where: {
        careCircleId: careCircle.id,
        acceptedAt: null,
      },
      include: {
        invitedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.careCircleMember.findUnique({
      where: {
        userId_careCircleId: {
          userId: user.id,
          careCircleId: careCircle.id,
        },
      },
      select: { role: true },
    }),
  ]);

  const isAdmin = currentMembership?.role === "ADMIN";
  const appUrl = getAppUrl();
  const invitationLink = params?.token
    ? `${appUrl}/invitacion/${params.token}`
    : null;

  return (
    <div>
      <PageHeader eyebrow="Equipo" title="Invitá a la familia y organizá roles.">
        Una persona crea el círculo de cuidado y después suma familiares o
        cuidadores con permisos claros.
      </PageHeader>

      {params?.error ? (
        <p className="mb-5 rounded-2xl bg-[#fff4de] p-4 text-sm font-semibold text-[color:var(--care-warning)]">
          {params.error}
        </p>
      ) : null}

      {params?.success ? (
        <p className="mb-5 rounded-2xl bg-[#e6f7ef] p-4 text-sm font-semibold text-[color:var(--care-success)]">
          {params.success}
        </p>
      ) : null}

      {invitationLink ? (
        <Card className="mb-6 p-5">
          <p className="text-sm font-semibold text-[color:var(--care-muted)]">
            Enlace de invitación
          </p>
          <p className="mt-2 break-all rounded-2xl bg-[#f8fbfd] p-4 font-mono text-sm text-[color:var(--care-ink)]">
            {invitationLink}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton value={invitationLink} />
            <p className="text-sm text-[color:var(--care-muted)]">
              Compartí este enlace manualmente con la persona invitada.
            </p>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="mb-5 text-xl font-semibold">Miembros activos</h2>
            <div className="grid gap-4">
              {members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{member.user.name}</h3>
                      <p className="text-sm text-[color:var(--care-muted)]">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge tone={member.role === "ADMIN" ? "teal" : "neutral"}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-xl font-semibold">Invitaciones pendientes</h2>
            <div className="grid gap-4">
              {invitations.length ? (
                invitations.map((invitation) => (
                  <article
                    key={invitation.id}
                    className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {invitation.name || invitation.email}
                        </h3>
                        <p className="text-sm text-[color:var(--care-muted)]">
                          {invitation.email}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--care-muted)]">
                          Invitó {invitation.invitedBy.name} · vence el{" "}
                          {formatShortDate(invitation.expiresAt)}
                        </p>
                      </div>
                      <Badge tone="warning">{roleLabels[invitation.role]}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 rounded-2xl bg-white p-3">
                      <p className="break-all font-mono text-xs text-[color:var(--care-ink-soft)]">
                        {appUrl}/invitacion/{invitation.token}
                      </p>
                      <CopyButton
                        value={`${appUrl}/invitacion/${invitation.token}`}
                        label="Copiar"
                      />
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="No hay invitaciones pendientes." />
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Invitar miembro</h2>
          {isAdmin ? (
            <form action={createInvitationAction} className="grid gap-4">
              <Field label="Nombre opcional">
                <input className={inputClassName} name="name" />
              </Field>
              <Field label="Email">
                <input className={inputClassName} type="email" name="email" required />
              </Field>
              <Field label="Rol">
                <select className={inputClassName} name="role" defaultValue="CAREGIVER">
                  <option value="CAREGIVER">Cuidador</option>
                  <option value="OBSERVER">Observador</option>
                </select>
              </Field>
              <PrimaryButton type="submit">Crear invitación</PrimaryButton>
            </form>
          ) : (
            <EmptyState title="Solo administradores pueden invitar miembros.">
              Pedí a un administrador del círculo que cree la invitación.
            </EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
}
