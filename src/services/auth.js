import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/services/db";

const SESSION_COOKIE = "cuida_session";
const ACTIVE_CARE_CIRCLE_COOKIE = "cuida_active_circle";
const SESSION_DAYS = 30;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId, activeCareCircleId = null) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  if (activeCareCircleId) {
    cookieStore.set(ACTIVE_CARE_CIRCLE_COOKIE, activeCareCircleId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ACTIVE_CARE_CIRCLE_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          memberships: {
            include: {
              careCircle: {
                include: {
                  patient: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  return session?.user || null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function setActiveCareCircleId(careCircleId) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_CARE_CIRCLE_COOKIE, careCircleId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getActiveCareCircleId() {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_CARE_CIRCLE_COOKIE)?.value || null;
}

export function getPrimaryCareCircle(user, activeCareCircleId = null) {
  const activeMembership = activeCareCircleId
    ? user.memberships.find(
        (membership) => membership.careCircle.id === activeCareCircleId,
      )
    : null;

  return activeMembership?.careCircle || user.memberships[0]?.careCircle || null;
}
