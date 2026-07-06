"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import { createSession, destroySession } from "@/services/auth";
import { hashPassword, verifyPassword } from "@/utils/passwords";
import { createActivity } from "@/services/activity";

const databaseErrorMessage =
  "No se pudo conectar con la base de datos. Revisá DATABASE_URL y las credenciales de PostgreSQL.";

function getField(formData, name) {
  return String(formData.get(name) || "").trim();
}

function isDatabaseConnectionError(error) {
  return (
    error?.name === "PrismaClientInitializationError" ||
    error?.code === "P1000" ||
    error?.code === "P1001" ||
    error?.code === "P1003"
  );
}

export async function registerAction(formData) {
  const name = getField(formData, "name");
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const patientName = getField(formData, "patientName");
  const patientAge = Number(getField(formData, "patientAge"));
  const medicalCondition = getField(formData, "medicalCondition");

  if (!name || !email || password.length < 8 || !patientName || !patientAge) {
    redirect(
      "/registro?error=Completá todos los campos obligatorios. La contraseña debe tener al menos 8 caracteres.",
    );
  }

  let existingUser;

  try {
    existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      redirect(`/registro?error=${encodeURIComponent(databaseErrorMessage)}`);
    }

    throw error;
  }

  if (existingUser) {
    redirect("/registro?error=Ya existe una cuenta con ese email.");
  }

  let user;

  try {
    user = await prisma.user.create({
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
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      redirect(`/registro?error=${encodeURIComponent(databaseErrorMessage)}`);
    }

    throw error;
  }

  await createActivity({
    careCircleId: user.memberships[0].careCircleId,
    userId: user.id,
    type: "CARE_CIRCLE_CREATED",
    message: `${user.name} creó el círculo de cuidado.`,
  });

  await createSession(user.id);
  redirect("/app");
}

export async function loginAction(formData) {
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      redirect(`/login?error=${encodeURIComponent(databaseErrorMessage)}`);
    }

    throw error;
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=Email o contraseña incorrectos.");
  }

  await createSession(user.id);
  redirect("/app");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
