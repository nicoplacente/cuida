"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import {
  clearActiveCareCircleId,
  createSession,
  getCurrentUser,
  setActiveCareCircleId,
} from "@/services/auth";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import {
  deleteDocumentObjects,
  isCareCircleDocumentKey,
} from "@/services/document-storage";
import { getR2DeletionErrorMessage } from "@/services/r2";
import { getAppUrl } from "@/utils/app-url";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getCheckboxField, getFormField, isValidEmail } from "@/utils/form-data";
import {
  createInvitationExpiration,
  getInvitationRoleLabel,
  isInvitationExpired,
  isValidInvitationToken,
} from "@/utils/invitations";
import {
  hashPassword,
  isValidNewPassword,
  maximumPasswordLength,
  verifyPassword,
} from "@/utils/passwords";
import { unexpectedActionError } from "@/utils/server-action-result";
import {
  canLeaveCareCircle,
  getNextCareCircleId,
  isCareRole,
} from "@/utils/team-permissions";

const allowedInviteRoles = new Set(["CAREGIVER", "OBSERVER"]);
const roleLabels = {
  ADMIN: "administrador",
  CAREGIVER: "cuidador",
  OBSERVER: "observador",
};

class TeamValidationError extends Error {}
class InvitationValidationError extends Error {}

async function requireAdminMembership(userId, careCircleId) {
  const membership = await prisma.careCircleMember.findUnique({
    where: {
      userId_careCircleId: {
        userId,
        careCircleId,
      },
    },
    select: { role: true },
  });

  return membership?.role === "ADMIN";
}

async function getAvailableInvitation(token) {
  if (!isValidInvitationToken(token)) {
    throw new InvitationValidationError("La invitación no es válida o fue cancelada.");
  }

  const invitation = await prisma.careInvitation.findUnique({
    where: { token },
    select: {
      acceptedAt: true,
      careCircleId: true,
      expiresAt: true,
      id: true,
      role: true,
    },
  });

  if (!invitation) {
    throw new InvitationValidationError("La invitación no es válida o fue cancelada.");
  }
  if (invitation.acceptedAt) {
    throw new InvitationValidationError("La invitación no es válida o fue cancelada.");
  }
  if (isInvitationExpired(invitation.expiresAt)) {
    throw new InvitationValidationError("La invitación venció. Pedí un nuevo enlace.");
  }

  return invitation;
}

async function addInvitationMembership(invitation, user) {
  return prisma.$transaction(async (transaction) => {
    const result = await transaction.careCircleMember.createMany({
      data: [
        {
          careCircleId: invitation.careCircleId,
          role: invitation.role,
          userId: user.id,
        },
      ],
      skipDuplicates: true,
    });

    if (result.count) {
      await transaction.activity.create({
        data: {
          careCircleId: invitation.careCircleId,
          userId: user.id,
          type: "INVITATION_ACCEPTED",
          message: `${user.name} se sumó al equipo de cuidado.`,
        },
      });
    }

    return Boolean(result.count);
  });
}

function revalidateTeam() {
  revalidatePath("/app");
  revalidatePath("/app/equipo");
}

async function selectNextCareCircle(userId, currentCareCircleId) {
  const memberships = await prisma.careCircleMember.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { careCircleId: true },
  });
  const nextCareCircleId = getNextCareCircleId(
    memberships.map((membership) => membership.careCircleId),
    currentCareCircleId,
  );

  if (nextCareCircleId) {
    await setActiveCareCircleId(nextCareCircleId);
    return "/app";
  }

  await clearActiveCareCircleId();
  return "/app/circulos/nuevo";
}

export async function createInvitationAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const role = getFormField(formData, "role");

    if (!careCircle) {
      return actionError("No hay un círculo de cuidado activo.");
    }

    if (!(await requireAdminMembership(user.id, careCircle.id))) {
      return actionError("Solo un administrador puede invitar miembros.");
    }

    if (!allowedInviteRoles.has(role)) {
      return actionError("Seleccioná un rol válido para la invitación.");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = createInvitationExpiration();

    await prisma.careInvitation.create({
      data: {
        careCircleId: careCircle.id,
        invitedById: user.id,
        role,
        token,
        expiresAt,
      },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEMBER_INVITED",
      message: `${user.name} creó un enlace de invitación para el rol de ${getInvitationRoleLabel(role).toLocaleLowerCase("es-AR")}.`,
    });

    revalidatePath("/app/equipo");
    return actionSuccess("Enlace de invitación creado correctamente.", {
      link: `${getAppUrl()}/invitacion/${token}`,
      roleLabel: getInvitationRoleLabel(role),
    });
  } catch (error) {
    return unexpectedActionError("createInvitationAction", error);
  }
}

export async function updateMemberRoleAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const memberId = getFormField(formData, "memberId");
    const role = getFormField(formData, "role");

    if (!careCircle || !(await requireAdminMembership(user.id, careCircle.id))) {
      return actionError("Solo un administrador puede cambiar roles.");
    }
    if (!memberId || !isCareRole(role)) {
      return actionError("Seleccioná un miembro y un rol válidos.");
    }

    const member = await prisma.careCircleMember.findFirst({
      where: { id: memberId, careCircleId: careCircle.id },
      select: {
        id: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    if (!member) {
      return actionError("El miembro ya no pertenece a este grupo.");
    }
    if (member.userId === user.id) {
      return actionError("No podés cambiar tu propio rol.");
    }

    await prisma.$transaction([
      prisma.careCircleMember.update({
        where: { id: member.id },
        data: { role },
      }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "MEMBER_ROLE_UPDATED",
          message: `${user.name} cambió el rol de ${member.user.name} a ${roleLabels[role]}.`,
        },
      }),
    ]);

    revalidateTeam();
    return actionSuccess(`Ahora ${member.user.name} tiene el rol de ${roleLabels[role]}.`);
  } catch (error) {
    return unexpectedActionError("updateMemberRoleAction", error);
  }
}

export async function removeMemberAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const memberId = getFormField(formData, "memberId");

    if (!careCircle || !(await requireAdminMembership(user.id, careCircle.id))) {
      return actionError("Solo un administrador puede eliminar miembros.");
    }

    const member = await prisma.careCircleMember.findFirst({
      where: { id: memberId, careCircleId: careCircle.id },
      select: {
        id: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    if (!member) {
      return actionError("El miembro ya no pertenece a este grupo.");
    }
    if (member.userId === user.id) {
      return actionError("Usá la opción Salir del grupo de cuidado para abandonar el grupo.");
    }

    await prisma.$transaction([
      prisma.careCircleMember.delete({ where: { id: member.id } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "MEMBER_REMOVED",
          message: `${user.name} eliminó a ${member.user.name} del grupo de cuidado.`,
        },
      }),
    ]);

    revalidateTeam();
    return actionSuccess(`${member.user.name} ya no tiene acceso a este grupo.`);
  } catch (error) {
    return unexpectedActionError("removeMemberAction", error);
  }
}

export async function revokeInvitationAction(_previousState, formData) {
  try {
    const { user, careCircle } = await requireCareContext();
    const invitationId = getFormField(formData, "invitationId");

    if (!careCircle || !(await requireAdminMembership(user.id, careCircle.id))) {
      return actionError("Solo un administrador puede cancelar invitaciones.");
    }

    const invitation = await prisma.careInvitation.findFirst({
      where: {
        acceptedAt: null,
        id: invitationId,
        careCircleId: careCircle.id,
      },
      select: { id: true, role: true },
    });

    if (!invitation) {
      return actionError("La invitación ya no está pendiente.");
    }

    const invitationRole = getInvitationRoleLabel(invitation.role).toLocaleLowerCase("es-AR");
    await prisma.$transaction([
      prisma.careInvitation.delete({ where: { id: invitation.id } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "INVITATION_REVOKED",
          message: `${user.name} canceló un enlace de invitación para el rol de ${invitationRole}.`,
        },
      }),
    ]);

    revalidateTeam();
    return actionSuccess(`Se canceló el enlace para el rol de ${invitationRole}.`);
  } catch (error) {
    return unexpectedActionError("revokeInvitationAction", error);
  }
}

export async function leaveCareCircleAction(_previousState, _formData) {
  let destination = "/app";

  try {
    const { user, careCircle } = await requireCareContext();

    if (!careCircle) {
      return actionError("No hay un grupo de cuidado activo.");
    }

    await prisma.$transaction(
      async (transaction) => {
        const membership = await transaction.careCircleMember.findUnique({
          where: {
            userId_careCircleId: {
              userId: user.id,
              careCircleId: careCircle.id,
            },
          },
          select: { id: true, role: true },
        });

        if (!membership) {
          throw new TeamValidationError("Ya no pertenecés a este grupo de cuidado.");
        }

        if (membership.role === "ADMIN") {
          const adminCount = await transaction.careCircleMember.count({
            where: { careCircleId: careCircle.id, role: "ADMIN" },
          });

          if (!canLeaveCareCircle({ adminCount, role: membership.role })) {
            throw new TeamValidationError(
              "Antes de salir, asigná el rol de administrador a otro miembro.",
            );
          }
        }

        await transaction.activity.create({
          data: {
            careCircleId: careCircle.id,
            userId: user.id,
            type: "MEMBER_LEFT",
            message: `${user.name} salió del grupo de cuidado.`,
          },
        });
        await transaction.careCircleMember.delete({ where: { id: membership.id } });
      },
      { isolationLevel: "Serializable" },
    );

    destination = await selectNextCareCircle(user.id, careCircle.id);
    revalidateTeam();
  } catch (error) {
    if (error instanceof TeamValidationError) {
      return actionError(error.message);
    }
    if (error?.code === "P2034") {
      return actionError("El grupo cambió mientras intentabas salir. Intentá nuevamente.");
    }
    return unexpectedActionError("leaveCareCircleAction", error);
  }

  redirect(destination);
}

export async function deleteCareCircleAction(_previousState, _formData) {
  let destination = "/app";

  try {
    const { user, careCircle } = await requireCareContext();

    if (!careCircle || !(await requireAdminMembership(user.id, careCircle.id))) {
      return actionError("Solo un administrador puede eliminar el grupo de cuidado.");
    }

    const documents = await prisma.document.findMany({
      where: { careCircleId: careCircle.id },
      select: { filePath: true },
    });
    const hasInvalidObjectKey = documents.some(
      (document) => !isCareCircleDocumentKey(document.filePath, careCircle.id),
    );

    if (hasInvalidObjectKey) {
      return actionError("No se pudo validar uno de los archivos del grupo.");
    }

    await deleteDocumentObjects(documents.map((document) => document.filePath));
    await prisma.careCircle.delete({ where: { id: careCircle.id } });

    destination = await selectNextCareCircle(user.id, careCircle.id);
    revalidateTeam();
  } catch (error) {
    const deletionErrorMessage = getR2DeletionErrorMessage(error);
    if (deletionErrorMessage) {
      return actionError(deletionErrorMessage);
    }
    return unexpectedActionError("deleteCareCircleAction", error);
  }

  redirect(destination);
}

export async function acceptInvitationAction(_previousState, formData) {
  const token = getFormField(formData, "token");

  try {
    const [invitation, user] = await Promise.all([
      getAvailableInvitation(token),
      getCurrentUser(),
    ]);

    if (!user) {
      return actionError("Iniciá sesión o creá una cuenta para aceptar la invitación.");
    }

    await addInvitationMembership(invitation, user);
    await setActiveCareCircleId(invitation.careCircleId);
  } catch (error) {
    if (error instanceof InvitationValidationError) {
      return actionError(error.message);
    }
    return unexpectedActionError("acceptInvitationAction", error);
  }

  redirect("/app");
}

export async function loginWithInvitationAction(_previousState, formData) {
  const token = getFormField(formData, "token");
  const email = getFormField(formData, "email").toLowerCase();
  const password = getFormField(formData, "password");
  const persistent = getCheckboxField(formData, "rememberSession");

  if (!isValidEmail(email) || !password || password.length > maximumPasswordLength) {
    return actionError("Ingresá un email y una contraseña válidos.");
  }

  try {
    const invitation = await getAvailableInvitation(token);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return actionError("Email o contraseña incorrectos.");
    }

    await addInvitationMembership(invitation, user);
    await createSession(user.id, invitation.careCircleId, { persistent });
  } catch (error) {
    if (error instanceof InvitationValidationError) {
      return actionError(error.message);
    }
    return unexpectedActionError("loginWithInvitationAction", error);
  }

  redirect("/app");
}

export async function registerWithInvitationAction(_previousState, formData) {
  const token = getFormField(formData, "token");
  const name = getFormField(formData, "name");
  const email = getFormField(formData, "email").toLowerCase();
  const password = getFormField(formData, "password");

  if (!name || !isValidEmail(email) || !isValidNewPassword(password)) {
    return actionError(
      "Completá los campos obligatorios. La contraseña debe tener entre 8 y 128 caracteres.",
    );
  }

  try {
    const invitation = await getAvailableInvitation(token);
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return actionError("Ya existe una cuenta con ese email. Iniciá sesión para continuar.");
    }

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email,
          name,
          passwordHash: hashPassword(password),
        },
        select: { id: true, name: true },
      });

      await transaction.careCircleMember.create({
        data: {
          careCircleId: invitation.careCircleId,
          role: invitation.role,
          userId: createdUser.id,
        },
      });
      await transaction.activity.create({
        data: {
          careCircleId: invitation.careCircleId,
          userId: createdUser.id,
          type: "INVITATION_ACCEPTED",
          message: `${createdUser.name} se sumó al equipo de cuidado.`,
        },
      });

      return createdUser;
    });

    await createSession(user.id, invitation.careCircleId);
  } catch (error) {
    if (error instanceof InvitationValidationError) {
      return actionError(error.message);
    }
    if (error?.code === "P2002") {
      return actionError("Ya existe una cuenta con ese email. Iniciá sesión para continuar.");
    }
    return unexpectedActionError("registerWithInvitationAction", error);
  }

  redirect("/app");
}
