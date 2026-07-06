"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { createSession, setActiveCareCircleId } from "@/services/auth";
import { requireCareContext } from "@/services/care-circle";
import { createActivity } from "@/services/activity";
import { hashPassword, verifyPassword } from "@/utils/passwords";

const allowedInviteRoles = new Set(["CAREGIVER", "OBSERVER"]);

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

function teamRedirect(params) {
  redirect(`/app/equipo?${new URLSearchParams(params).toString()}`);
}

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

export async function createInvitationAction(formData) {
  const { user, careCircle } = await requireCareContext();
  const name = getField(formData, "name");
  const email = getField(formData, "email").toLowerCase();
  const role = getField(formData, "role");

  if (!careCircle) {
    teamRedirect({ error: "No hay un círculo de cuidado activo." });
  }

  const isAdmin = await requireAdminMembership(user.id, careCircle.id);

  if (!isAdmin) {
    teamRedirect({ error: "Solo un administrador puede invitar miembros." });
  }

  if (!email || !email.includes("@")) {
    teamRedirect({ error: "Ingresá un email válido." });
  }

  if (!allowedInviteRoles.has(role)) {
    teamRedirect({ error: "Seleccioná un rol válido para la invitación." });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      memberships: {
        where: { careCircleId: careCircle.id },
        select: { id: true },
      },
    },
  });

  if (existingUser?.memberships.length) {
    teamRedirect({ error: "Ese usuario ya pertenece a este círculo." });
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
  teamRedirect({
    success: "Invitación creada correctamente.",
    token,
  });
}

export async function acceptInvitationAction(formData) {
  const token = getField(formData, "token");
  const name = getField(formData, "name");
  const password = getField(formData, "password");

  const invitation = await prisma.careInvitation.findUnique({
    where: { token },
    include: {
      careCircle: true,
    },
  });

  if (!invitation || invitation.acceptedAt) {
    redirect("/login?error=La invitación no existe o ya fue utilizada.");
  }

  if (invitation.expiresAt < new Date()) {
    redirect("/login?error=La invitación expiró. Pedí una nueva invitación.");
  }

  let user = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (user && !verifyPassword(password, user.passwordHash)) {
    redirect(
      `/invitacion/${token}?error=${encodeURIComponent(
        "La contraseña no coincide con la cuenta asociada a esta invitación.",
      )}`,
    );
  }

  if (!user && (!name || password.length < 8)) {
    redirect(
      `/invitacion/${token}?error=${encodeURIComponent(
        "Ingresá tu nombre y una contraseña de al menos 8 caracteres.",
      )}`,
    );
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
      update: {
        role: invitation.role,
      },
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
  redirect("/app");
}
