"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { sendPasswordResetEmail } from "@/services/email";
import { createSession, destroySession } from "@/services/auth";
import { createActivity } from "@/services/activity";
import { getAppUrl } from "@/utils/app-url";
import { actionError, actionSuccess } from "@/utils/action-result";
import {
  getCheckboxField,
  getFormField,
  isValidEmail,
  parseDateInput,
} from "@/utils/form-data";
import { calculateAge } from "@/utils/patients";
import {
  hashPassword,
  isValidNewPassword,
  maximumPasswordLength,
  verifyPassword,
} from "@/utils/passwords";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  isValidPasswordResetToken,
} from "@/utils/password-reset";
import { logServerError } from "@/utils/safe-logger";
import { unexpectedActionError } from "@/utils/server-action-result";

const resetRequestMessage =
  "Si el email pertenece a una cuenta, vas a recibir un enlace para restablecer la contraseña.";
const resetTokenLifetime = 30 * 60 * 1000;
const resetRequestCooldown = 60 * 1000;
const minimumResetResponseTime = 800;

async function normalizeResetResponseTime(startedAt) {
  const remainingTime = minimumResetResponseTime - (Date.now() - startedAt);
  if (remainingTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingTime));
  }
}

export async function registerAction(_previousState, formData) {
  const name = getFormField(formData, "name");
  const email = getFormField(formData, "email").toLowerCase();
  const password = getFormField(formData, "password");
  const patientName = getFormField(formData, "patientName");
  const birthDateValue = getFormField(formData, "birthDate");
  const birthDate = parseDateInput(birthDateValue);
  const patientAge = birthDate ? calculateAge(birthDate) : null;
  const medicalCondition = getFormField(formData, "medicalCondition");

  if (!name || !isValidEmail(email) || !isValidNewPassword(password) || !patientName) {
    return actionError(
      "Completá los campos obligatorios. La contraseña debe tener al menos 8 caracteres.",
    );
  }
  if (!birthDate || patientAge === null) {
    return actionError("Ingresá una fecha de nacimiento válida.");
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return actionError(
        "No pudimos crear la cuenta con esos datos. Si ya tenés una cuenta, iniciá sesión.",
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        memberships: {
          create: {
            role: "ADMIN",
            careCircle: {
              create: {
                name: `Círculo de ${patientName}`,
                patient: {
                  create: {
                    name: patientName,
                    age: patientAge,
                    birthDate,
                    medicalCondition: medicalCondition || null,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    await createActivity({
      careCircleId: user.memberships[0].careCircleId,
      userId: user.id,
      type: "CARE_CIRCLE_CREATED",
      message: `${user.name} creó el círculo de cuidado.`,
    });

    await createSession(user.id);
  } catch (error) {
    return unexpectedActionError("registerAction", error);
  }

  redirect("/app");
}

export async function loginAction(_previousState, formData) {
  const email = getFormField(formData, "email").toLowerCase();
  const password = getFormField(formData, "password");
  const persistent = getCheckboxField(formData, "rememberSession");

  if (!isValidEmail(email) || !password || password.length > maximumPasswordLength) {
    return actionError("Ingresá un email y una contraseña válidos.");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return actionError("Email o contraseña incorrectos.");
    }

    await createSession(user.id, null, { persistent });
  } catch (error) {
    return unexpectedActionError("loginAction", error);
  }

  redirect("/app");
}

export async function requestPasswordResetAction(_previousState, formData) {
  const email = getFormField(formData, "email").toLowerCase();

  if (!isValidEmail(email)) {
    return actionError("Ingresá un email válido.");
  }

  const startedAt = Date.now();
  let result = actionSuccess(resetRequestMessage);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      const recentRequest = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          createdAt: { gt: new Date(Date.now() - resetRequestCooldown) },
        },
        select: { id: true },
      });

      if (!recentRequest) {
        const token = createPasswordResetToken();
        const tokenHash = hashPasswordResetToken(token);
        const expiresAt = new Date(Date.now() + resetTokenLifetime);

        await prisma.$transaction([
          prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
          prisma.passwordResetToken.create({
            data: { tokenHash, userId: user.id, expiresAt },
          }),
        ]);

        try {
          await sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetUrl: `${getAppUrl()}/restablecer-contrasena/${token}`,
          });
        } catch (error) {
          await prisma.passwordResetToken
            .deleteMany({ where: { tokenHash } })
            .catch(() => null);
          logServerError("requestPasswordResetAction:send", error, {
            code: "PASSWORD_RESET_EMAIL_FAILED",
          });
        }
      }
    }
  } catch (error) {
    result = unexpectedActionError("requestPasswordResetAction", error);
  }

  await normalizeResetResponseTime(startedAt);
  return result;
}

export async function resetPasswordAction(_previousState, formData) {
  const token = getFormField(formData, "token");
  const password = getFormField(formData, "password");
  const passwordConfirmation = getFormField(formData, "passwordConfirmation");

  if (!isValidPasswordResetToken(token)) {
    return actionError("El enlace no es válido o ya venció. Solicitá uno nuevo.");
  }

  if (!isValidNewPassword(password)) {
    return actionError("La contraseña debe tener entre 8 y 128 caracteres.");
  }

  if (password !== passwordConfirmation) {
    return actionError("Las contraseñas no coinciden.");
  }

  const tokenHash = hashPasswordResetToken(token);

  try {
    const passwordWasUpdated = await prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { id: true, userId: true, expiresAt: true },
      });

      if (!resetToken || resetToken.expiresAt <= new Date()) {
        return false;
      }

      const consumedToken = await transaction.passwordResetToken.deleteMany({
        where: {
          id: resetToken.id,
          expiresAt: { gt: new Date() },
        },
      });

      if (consumedToken.count !== 1) {
        return false;
      }

      await transaction.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: hashPassword(password) },
      });

      await Promise.all([
        transaction.session.deleteMany({ where: { userId: resetToken.userId } }),
        transaction.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
      ]);

      return true;
    });

    if (!passwordWasUpdated) {
      return actionError("El enlace no es válido o ya venció. Solicitá uno nuevo.");
    }

    return actionSuccess("Contraseña actualizada. Ya podés iniciar sesión.");
  } catch (error) {
    return unexpectedActionError("resetPasswordAction", error);
  }
}

export async function logoutAction() {
  try {
    await destroySession();
  } catch (error) {
    return unexpectedActionError("logoutAction", error);
  }

  redirect("/");
}
