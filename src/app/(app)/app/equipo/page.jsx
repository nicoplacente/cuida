import {
  createInvitationAction,
  deleteCareCircleAction,
  leaveCareCircleAction,
  removeMemberAction,
  revokeInvitationAction,
  updateMemberRoleAction,
} from "@/features/team/actions";
import { requireCareContext, getCareCircleMembers } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { ConfirmationButton } from "@/components/confirmation-button";
import { InvitationForm } from "@/components/invitation-form";
import { ShareInvitationButton } from "@/components/share-invitation-modal";
import { SecondarySubmitButton, ToastForm } from "@/components/toast-form";
import { Badge, Card, EmptyState, inputClassName } from "@/components/ui";
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
  const isLastAdmin = isAdmin && members.filter((member) => member.role === "ADMIN").length === 1;
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
                      <h3 className="text-lg font-semibold">
                        {member.user.name}
                        {member.user.id === user.id ? " (vos)" : ""}
                      </h3>
                      <p className="text-sm text-[color:var(--care-muted)]">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge tone={member.role === "ADMIN" ? "teal" : "neutral"}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                  {isAdmin && member.user.id !== user.id ? (
                    <div className="mt-4 flex flex-col gap-3 border-t border-[color:var(--care-cloud)] pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <ToastForm
                        action={updateMemberRoleAction}
                        className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end"
                        key={`${member.id}-${member.role}`}
                      >
                        <input name="memberId" type="hidden" value={member.id} />
                        <label className="grid flex-1 gap-2 text-sm font-semibold">
                          <span>Rol del miembro</span>
                          <select
                            className={`${inputClassName} sm:max-w-56`}
                            defaultValue={member.role}
                            name="role"
                          >
                            <option value="ADMIN">Administrador</option>
                            <option value="CAREGIVER">Cuidador</option>
                            <option value="OBSERVER">Observador</option>
                          </select>
                        </label>
                        <SecondarySubmitButton pendingLabel="Guardando…">
                          Guardar rol
                        </SecondarySubmitButton>
                      </ToastForm>
                      <ConfirmationButton
                        action={removeMemberAction}
                        confirmLabel={`Eliminar a ${member.user.name}`}
                        description={`${member.user.name} perderá inmediatamente el acceso a este grupo de cuidado.`}
                        eyebrow="Eliminar miembro"
                        fields={{ memberId: member.id }}
                        pendingLabel="Eliminando…"
                        title={`¿Eliminar a ${member.user.name}?`}
                        triggerLabel="Eliminar miembro"
                      />
                    </div>
                  ) : null}
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
                    <div className="mt-3 flex flex-wrap gap-3">
                      <ShareInvitationButton
                        invitation={{
                          email: invitation.email,
                          name: invitation.name || invitation.email,
                          link: `${appUrl}/invitacion/${invitation.token}`,
                        }}
                      />
                      {isAdmin ? (
                        <ConfirmationButton
                          action={revokeInvitationAction}
                          confirmLabel="Cancelar invitación"
                          description={`El enlace enviado a ${invitation.name || invitation.email} dejará de ser válido inmediatamente.`}
                          eyebrow="Cancelar invitación"
                          fields={{ invitationId: invitation.id }}
                          pendingLabel="Cancelando…"
                          title={`¿Cancelar la invitación de ${invitation.name || invitation.email}?`}
                          triggerLabel="Cancelar invitación"
                        />
                      ) : null}
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

      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold">Gestión del grupo</h2>
            <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
              Salir elimina únicamente tu acceso. Eliminar el grupo borra permanentemente
              toda la información compartida.
            </p>
            {isLastAdmin ? (
              <p className="mt-3 text-sm font-semibold text-[color:var(--care-warning)]">
                Para salir, primero asigná el rol de administrador a otro miembro.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ConfirmationButton
              action={leaveCareCircleAction}
              confirmLabel="Salir del grupo"
              description={`Dejarás de tener acceso a ${careCircle.name} y a toda su información compartida.`}
              disabled={isLastAdmin}
              eyebrow="Salir del grupo"
              pendingLabel="Saliendo…"
              title={`¿Salir de ${careCircle.name}?`}
              triggerLabel="Salir del grupo de cuidado"
              triggerTitle={
                isLastAdmin
                  ? "Asigná otro administrador antes de salir"
                  : "Salir del grupo de cuidado"
              }
            />
            {isAdmin ? (
              <ConfirmationButton
                action={deleteCareCircleAction}
                confirmLabel="Eliminar grupo definitivamente"
                description={`Se eliminarán permanentemente ${careCircle.name}, los datos de la persona cuidada, miembros, invitaciones, medicamentos, tareas, eventos, historial y documentos. Esta acción no se puede deshacer.`}
                eyebrow="Eliminar grupo de cuidado"
                pendingLabel="Eliminando grupo…"
                title={`¿Eliminar ${careCircle.name}?`}
                triggerLabel="Eliminar grupo de cuidado"
              />
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
