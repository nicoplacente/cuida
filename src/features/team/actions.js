"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { createSession, setActiveCareCircleId } from "@/services/auth";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { getAppUrl } from "@/utils/app-url";
import { actionError, actionSuccess } from "@/utils/action-result";
import { getFormField, isValidEmail } from "@/utils/form-data";
import { hashPassword, isValidNewPassword, verifyPassword } from "@/utils/passwords";
import { unexpectedActionError } from "@/utils/server-action-result";

const allowedInviteRoles = new Set(["CAREGIVER", "OBSERVER"]);

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
