import { createInvitationAction } from "@/features/team/actions";
import { requireCareContext, getCareCircleMembers } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { InvitationForm } from "@/components/invitation-form";
import { ShareInvitationButton } from "@/components/share-invitation-modal";
import { Badge, Card, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { formatShortDate } from "@/utils/dates";
import { getAppUrl } from "@/utils/app-url";

const roleLabels = {
  ADMIN: "Administrador",
  CAREGIVER: "Cuidador",
  OBSERVER: "Observador",
};

export default async function TeamPage() {
  const { user, careCircle } = await requireCareContext();

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

  return (
    <div>
      <PageHeader eyebrow="Equipo" title="Invitá a la familia y organizá roles.">
        Una persona crea el círculo de cuidado y después suma familiares o
        cuidadores con permisos claros.
      </PageHeader>

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
                    <div className="mt-3">
                      <ShareInvitationButton
                        invitation={{
                          email: invitation.email,
                          name: invitation.name || invitation.email,
                          link: `${appUrl}/invitacion/${invitation.token}`,
                        }}
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
            <InvitationForm action={createInvitationAction} />
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
