import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/services/db";
import {
  REFRESH_TOKEN_GRACE_MS,
  SESSION_PERSISTENCE,
  createAccessToken,
  createRefreshToken,
  createSessionSecret,
  getRefreshVersionStatus,
  getSessionExpiresAt,
  hashSessionToken,
  isLegacyRefreshToken,
  matchesSessionTokenHash,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/session-tokens";
import { SafeServerError } from "@/utils/safe-logger";

const ACCESS_COOKIE = "cuida_access";
const SESSION_COOKIE = "cuida_session";
const ACTIVE_CARE_CIRCLE_COOKIE = "cuida_active_circle";

const userSelection = {
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
};

function getSigningSecret() {
  const signingSecret = process.env.SESSION_SECRET;

  if (!signingSecret) {
    throw new SafeServerError("AUTH_CONFIGURATION_ERROR");
  }

  return signingSecret;
}

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function getPersistentCookieOptions(persistence, expiresAt) {
  return persistence === SESSION_PERSISTENCE.PERSISTENT
    ? { expires: expiresAt }
    : {};
}

function setAuthCookies(
  cookieStore,
  {
    accessToken,
    accessExpiresAt,
    refreshToken,
    persistence,
    sessionExpiresAt,
  },
) {
  const baseOptions = getBaseCookieOptions();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    ...getPersistentCookieOptions(persistence, accessExpiresAt),
  });
  cookieStore.set(SESSION_COOKIE, refreshToken, {
    ...baseOptions,
    ...getPersistentCookieOptions(persistence, sessionExpiresAt),
  });
}

function clearAuthCookies(cookieStore) {
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ACTIVE_CARE_CIRCLE_COOKIE);
}

function setActiveCareCircleCookie(
  cookieStore,
  careCircleId,
  persistence,
  sessionExpiresAt,
) {
  cookieStore.set(ACTIVE_CARE_CIRCLE_COOKIE, careCircleId, {
    ...getBaseCookieOptions(),
    ...getPersistentCookieOptions(persistence, sessionExpiresAt),
  });
}

async function findSession(where, { includeUser = true } = {}) {
  return prisma.session.findFirst({
    where,
    ...(includeUser
      ? {
          include: {
            user: {
              select: userSelection,
            },
          },
        }
      : {
          select: {
            id: true,
            tokenHash: true,
            refreshVersion: true,
            previousRefreshVersion: true,
            previousRefreshExpiresAt: true,
            userId: true,
            expiresAt: true,
          },
        }),
  });
}

async function getRefreshSession(
  refreshToken,
  now = new Date(),
  { includeUser = true } = {},
) {
  if (!refreshToken) {
    return null;
  }

  if (isLegacyRefreshToken(refreshToken)) {
    const session = await findSession(
      {
        tokenHash: hashSessionToken(refreshToken),
        expiresAt: { gt: now },
      },
      { includeUser },
    );

    return session
      ? {
          session,
          persistence: SESSION_PERSISTENCE.PERSISTENT,
          refreshPayload: null,
          versionStatus: "legacy",
        }
      : null;
  }

  const refreshPayload = verifyRefreshToken(refreshToken, getSigningSecret());
  if (!refreshPayload) {
    return null;
  }

  const session = await findSession(
    {
      id: refreshPayload.sessionId,
      expiresAt: { gt: now },
    },
    { includeUser },
  );

  if (
    !session ||
    !matchesSessionTokenHash(refreshPayload.sessionSecret, session.tokenHash)
  ) {
    return null;
  }

  const versionStatus = getRefreshVersionStatus({
    presentedVersion: refreshPayload.version,
    currentVersion: session.refreshVersion,
    previousVersion: session.previousRefreshVersion,
    previousExpiresAt: session.previousRefreshExpiresAt,
    now: now.getTime(),
  });

  return versionStatus
    ? {
        session,
        persistence: refreshPayload.persistence,
        refreshPayload,
        versionStatus,
      }
    : null;
}

async function getAccessSession(accessToken, now = new Date()) {
  const accessPayload = verifyAccessToken(
    accessToken,
    getSigningSecret(),
    now.getTime(),
  );

  if (!accessPayload) {
    return null;
  }

  const session = await findSession({
    id: accessPayload.sessionId,
    userId: accessPayload.userId,
    expiresAt: { gt: now },
  });

  return session ? { session, accessPayload } : null;
}

async function revokeReusedRefreshToken(refreshToken, now) {
  const refreshPayload = verifyRefreshToken(refreshToken, getSigningSecret());
  if (!refreshPayload) {
    return;
  }

  const session = await prisma.session.findFirst({
    where: {
      id: refreshPayload.sessionId,
      expiresAt: { gt: now },
    },
    select: { id: true, tokenHash: true },
  });

  if (
    session &&
    matchesSessionTokenHash(refreshPayload.sessionSecret, session.tokenHash)
  ) {
    await prisma.session.deleteMany({ where: { id: session.id } });
  }
}

export async function createSession(
  userId,
  activeCareCircleId = null,
  { persistent = false } = {},
) {
  const now = Date.now();
  const persistence = persistent
    ? SESSION_PERSISTENCE.PERSISTENT
    : SESSION_PERSISTENCE.BROWSER;
  const sessionSecret = createSessionSecret();
  const sessionExpiresAt = getSessionExpiresAt(persistence, now);
  const signingSecret = getSigningSecret();

  await prisma.session.deleteMany({
    where: { expiresAt: { lte: new Date(now) } },
  });

  const session = await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(sessionSecret),
      userId,
      expiresAt: sessionExpiresAt,
    },
    select: { id: true, userId: true, refreshVersion: true },
  });

  const { token: accessToken, expiresAt: accessExpiresAt } = createAccessToken(
    { sessionId: session.id, userId: session.userId, now },
    signingSecret,
  );
  const refreshToken = createRefreshToken(
    {
      sessionId: session.id,
      sessionSecret,
      version: session.refreshVersion,
      persistence,
    },
    signingSecret,
  );

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, {
    accessToken,
    accessExpiresAt,
    refreshToken,
    persistence,
    sessionExpiresAt,
  });

  if (activeCareCircleId) {
    setActiveCareCircleCookie(
      cookieStore,
      activeCareCircleId,
      persistence,
      sessionExpiresAt,
    );
  }
}

export async function refreshSession() {
  const now = new Date();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(SESSION_COOKIE)?.value;
  const refreshContext = await getRefreshSession(refreshToken, now, {
    includeUser: false,
  });

  if (!refreshContext) {
    await revokeReusedRefreshToken(refreshToken, now);
    clearAuthCookies(cookieStore);
    return false;
  }

  const signingSecret = getSigningSecret();
  let {
    session,
    persistence,
    refreshPayload,
    versionStatus,
  } = refreshContext;
  let sessionSecret = refreshPayload?.sessionSecret;
  let refreshVersion = session.refreshVersion;
  let sessionExpiresAt = session.expiresAt;

  if (versionStatus === "legacy") {
    sessionSecret = createSessionSecret();
    const migratedSession = await prisma.session.updateMany({
      where: {
        id: session.id,
        tokenHash: hashSessionToken(refreshToken),
        expiresAt: { gt: now },
      },
      data: {
        tokenHash: hashSessionToken(sessionSecret),
        refreshVersion: 0,
        previousRefreshVersion: null,
        previousRefreshExpiresAt: null,
      },
    });

    if (migratedSession.count !== 1) {
      clearAuthCookies(cookieStore);
      return false;
    }
    refreshVersion = 0;
  } else if (versionStatus === "current") {
    const nextRefreshVersion = session.refreshVersion + 1;
    const nextSessionExpiresAt = persistence === SESSION_PERSISTENCE.BROWSER
      ? getSessionExpiresAt(persistence, now.getTime())
      : session.expiresAt;
    const rotatedSession = await prisma.session.updateMany({
      where: {
        id: session.id,
        tokenHash: session.tokenHash,
        refreshVersion: session.refreshVersion,
        expiresAt: { gt: now },
      },
      data: {
        refreshVersion: nextRefreshVersion,
        previousRefreshVersion: session.refreshVersion,
        previousRefreshExpiresAt: new Date(now.getTime() + REFRESH_TOKEN_GRACE_MS),
        expiresAt: nextSessionExpiresAt,
      },
    });

    if (rotatedSession.count === 1) {
      refreshVersion = nextRefreshVersion;
      sessionExpiresAt = nextSessionExpiresAt;
    } else {
      const concurrentContext = await getRefreshSession(refreshToken, now, {
        includeUser: false,
      });
      if (!concurrentContext || concurrentContext.versionStatus !== "previous") {
        clearAuthCookies(cookieStore);
        return false;
      }
      session = concurrentContext.session;
      persistence = concurrentContext.persistence;
      refreshPayload = concurrentContext.refreshPayload;
      sessionSecret = refreshPayload.sessionSecret;
      refreshVersion = session.refreshVersion;
      sessionExpiresAt = session.expiresAt;
    }
  }

  const { token: accessToken, expiresAt: accessExpiresAt } = createAccessToken(
    { sessionId: session.id, userId: session.userId, now: now.getTime() },
    signingSecret,
  );
  const nextRefreshToken = createRefreshToken(
    {
      sessionId: session.id,
      sessionSecret,
      version: refreshVersion,
      persistence,
    },
    signingSecret,
  );

  setAuthCookies(cookieStore, {
    accessToken,
    accessExpiresAt,
    refreshToken: nextRefreshToken,
    persistence,
    sessionExpiresAt,
  });

  return true;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(SESSION_COOKIE)?.value;
  const signingSecret = process.env.SESSION_SECRET || "";
  const accessPayload = verifyAccessToken(accessToken, signingSecret);
  const refreshPayload = verifyRefreshToken(refreshToken, signingSecret);

  if (refreshPayload?.sessionId || accessPayload?.sessionId) {
    await prisma.session.deleteMany({
      where: {
        id: refreshPayload?.sessionId || accessPayload.sessionId,
      },
    });
  } else if (isLegacyRefreshToken(refreshToken)) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(refreshToken) },
    });
  }

  clearAuthCookies(cookieStore);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(SESSION_COOKIE)?.value;
  const accessContext = accessToken
    ? await getAccessSession(accessToken)
    : null;

  if (accessContext) {
    return accessContext.session.user;
  }

  const refreshContext = refreshToken
    ? await getRefreshSession(refreshToken)
    : null;

  return refreshContext?.session.user || null;
}

export async function requireUser() {
  const cookieStore = await cookies();
  const hadSession = cookieStore.has(ACCESS_COOKIE) || cookieStore.has(SESSION_COOKIE);
  const user = await getCurrentUser();

  if (!user) {
    redirect(hadSession ? "/login?reason=session-expired" : "/login");
  }

  return user;
}

export async function setActiveCareCircleId(careCircleId) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(SESSION_COOKIE)?.value;
  const refreshContext = await getRefreshSession(refreshToken, new Date(), {
    includeUser: false,
  });

  if (!refreshContext) {
    return;
  }

  setActiveCareCircleCookie(
    cookieStore,
    careCircleId,
    refreshContext.persistence,
    refreshContext.session.expiresAt,
  );
}

export async function clearActiveCareCircleId() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_CARE_CIRCLE_COOKIE);
}

export async function getActiveCareCircleId() {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_CARE_CIRCLE_COOKIE)?.value || null;
}

export function getPrimaryCareCircle(user, activeCareCircleId = null) {
  return getPrimaryCareMembership(user, activeCareCircleId)?.careCircle || null;
}

export function getPrimaryCareMembership(user, activeCareCircleId = null) {
  const activeMembership = activeCareCircleId
    ? user.memberships.find(
        (membership) => membership.careCircle.id === activeCareCircleId,
      )
    : null;

  return activeMembership || user.memberships[0] || null;
}
