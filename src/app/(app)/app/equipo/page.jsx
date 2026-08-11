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
import { formatShortDate, formatTime } from "@/utils/dates";
import { getAppUrl } from "@/utils/app-url";

const roleLabels = {
  ADMIN: "Administrador",
  CAREGIVER: "Cuidador",
  OBSERVER: "Observador",
};
const compactActionClassName =
  "min-h-11 w-full sm:w-auto sm:whitespace-nowrap sm:px-4 sm:py-2 sm:text-sm";

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
        expiresAt: { gt: new Date() },
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
      <PageHeader eyebrow="Equipo" title="Compartí el cuidado con permisos claros.">
        Generá enlaces temporales por rol para sumar familiares y cuidadores al
        grupo.
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
                    <div className="mt-4 grid gap-3 border-t border-[color:var(--care-cloud)] pt-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                      <ToastForm
                        action={updateMemberRoleAction}
                        className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                        key={`${member.id}-${member.role}`}
                      >
                        <input name="memberId" type="hidden" value={member.id} />
                        <label className="grid min-w-0 gap-2 text-sm font-semibold">
                          <span>Rol del miembro</span>
                          <select
                            className={`${inputClassName} appearance-auto pr-10 leading-6`}
                            defaultValue={member.role}
                            name="role"
                          >
                            <option value="ADMIN">Administrador</option>
                            <option value="CAREGIVER">Cuidador</option>
                            <option value="OBSERVER">Observador</option>
                          </select>
                        </label>
                        <SecondarySubmitButton
                          className={compactActionClassName}
                          pendingLabel="Guardando…"
                        >
                          Guardar
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
                        triggerClassName={compactActionClassName}
                        triggerLabel="Eliminar miembro"
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-xl font-semibold">Enlaces activos</h2>
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
                          Enlace para {roleLabels[invitation.role].toLocaleLowerCase("es-AR")}
                        </h3>
                        <p className="mt-2 text-sm text-[color:var(--care-muted)]">
                          Invitó {invitation.invitedBy.name} · vence el{" "}
                          {formatShortDate(invitation.expiresAt)} a las{" "}
                          {formatTime(invitation.expiresAt)}
                        </p>
                      </div>
                      <Badge tone="warning">{roleLabels[invitation.role]}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <ShareInvitationButton
                        invitation={{
                          link: `${appUrl}/invitacion/${invitation.token}`,
                          roleLabel: roleLabels[invitation.role],
                        }}
                      />
                      {isAdmin ? (
                        <ConfirmationButton
                          action={revokeInvitationAction}
                          confirmLabel="Cancelar enlace"
                          description="El enlace dejará de ser válido inmediatamente para todas las personas que todavía no se hayan sumado."
                          eyebrow="Cancelar enlace"
                          fields={{ invitationId: invitation.id }}
                          pendingLabel="Cancelando…"
                          title={`¿Cancelar el enlace para ${roleLabels[invitation.role].toLocaleLowerCase("es-AR")}?`}
                          triggerLabel="Cancelar enlace"
                        />
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState title="No hay enlaces de invitación activos." />
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Generar enlace</h2>
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0 lg:justify-end">
            <ConfirmationButton
              action={leaveCareCircleAction}
              confirmLabel="Salir del grupo"
              description={`Dejarás de tener acceso a ${careCircle.name} y a toda su información compartida.`}
              disabled={isLastAdmin}
              eyebrow="Salir del grupo"
              pendingLabel="Saliendo…"
              title={`¿Salir de ${careCircle.name}?`}
              triggerClassName={compactActionClassName}
              triggerLabel="Salir del grupo"
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
                triggerClassName={compactActionClassName}
                triggerLabel="Eliminar grupo"
                triggerTitle="Eliminar grupo de cuidado"
              />
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
