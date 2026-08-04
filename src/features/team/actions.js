"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import {
  clearActiveCareCircleId,
  createSession,
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
import { getFormField, isValidEmail } from "@/utils/form-data";
import { hashPassword, isValidNewPassword, verifyPassword } from "@/utils/passwords";
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
    const name = getFormField(formData, "name");
    const email = getFormField(formData, "email").toLowerCase();
    const role = getFormField(formData, "role");

    if (!careCircle) {
      return actionError("No hay un círculo de cuidado activo.");
    }

    if (!(await requireAdminMembership(user.id, careCircle.id))) {
      return actionError("Solo un administrador puede invitar miembros.");
    }

    if (!isValidEmail(email)) {
      return actionError("Ingresá un email válido.");
    }

    if (!allowedInviteRoles.has(role)) {
      return actionError("Seleccioná un rol válido para la invitación.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        memberships: {
          where: { careCircleId: careCircle.id },
          select: { id: true },
        },
      },
    });

    if (existingUser?.memberships.length) {
      return actionError("Ese usuario ya pertenece a este círculo.");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.careInvitation.create({
      data: {
        careCircleId: careCircle.id,
        invitedById: user.id,
        email,
        name: name || null,
        role,
        token,
        expiresAt,
      },
    });

    await createActivity({
      careCircleId: careCircle.id,
      userId: user.id,
      type: "MEMBER_INVITED",
      message: `${user.name} invitó a ${email} al equipo de cuidado.`,
    });

    revalidatePath("/app/equipo");
    return actionSuccess("Invitación creada correctamente.", {
      email,
      name: name || email,
      link: `${getAppUrl()}/invitacion/${token}`,
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
        id: invitationId,
        careCircleId: careCircle.id,
        acceptedAt: null,
      },
      select: { email: true, id: true, name: true },
    });

    if (!invitation) {
      return actionError("La invitación ya no está pendiente.");
    }

    const invitationName = invitation.name || invitation.email;
    await prisma.$transaction([
      prisma.careInvitation.delete({ where: { id: invitation.id } }),
      prisma.activity.create({
        data: {
          careCircleId: careCircle.id,
          userId: user.id,
          type: "INVITATION_REVOKED",
          message: `${user.name} canceló la invitación de ${invitationName}.`,
        },
      }),
    ]);

    revalidateTeam();
    return actionSuccess(`Se canceló la invitación de ${invitationName}.`);
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
  const name = getFormField(formData, "name");
  const password = getFormField(formData, "password");

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return actionError("La invitación no es válida o ya fue utilizada.");
  }

  try {
    const invitation = await prisma.careInvitation.findUnique({
      where: { token },
      include: { careCircle: true },
    });

    if (!invitation || invitation.acceptedAt) {
      return actionError("La invitación no es válida o ya fue utilizada.");
    }

    if (invitation.expiresAt < new Date()) {
      return actionError("La invitación venció. Pedí una nueva invitación.");
    }

    let user = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (user && !verifyPassword(password, user.passwordHash)) {
      return actionError("La contraseña ingresada no es correcta.");
    }

    if (!user && (!name || !isValidNewPassword(password))) {
      return actionError("Ingresá tu nombre y una contraseña de entre 8 y 128 caracteres.");
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email: invitation.email,
          passwordHash: hashPassword(password),
        },
      });
    }

    await prisma.$transaction([
      prisma.careCircleMember.upsert({
        where: {
          userId_careCircleId: {
            userId: user.id,
            careCircleId: invitation.careCircleId,
          },
        },
        update: { role: invitation.role },
        create: {
          userId: user.id,
          careCircleId: invitation.careCircleId,
          role: invitation.role,
        },
      }),
      prisma.careInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
      prisma.activity.create({
        data: {
          careCircleId: invitation.careCircleId,
          userId: user.id,
          type: "INVITATION_ACCEPTED",
          message: `${user.name} se sumó al equipo de cuidado.`,
        },
      }),
    ]);

    await createSession(user.id, invitation.careCircleId);
    await setActiveCareCircleId(invitation.careCircleId);
  } catch (error) {
    return unexpectedActionError("acceptInvitationAction", error);
  }

  redirect("/app");
}
