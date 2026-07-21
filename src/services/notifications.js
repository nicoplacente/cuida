import webpush from "web-push";
import { prisma } from "./db.js";

const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "America/Argentina/Buenos_Aires";
const APP_TIME_ZONE_OFFSET = process.env.APP_TIME_ZONE_OFFSET || "-03:00";
const CLAIM_TIMEOUT_MS = 5 * 60 * 1000;

export function getNotificationDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function getStoredDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function getScheduledInstant(dateKey, time) {
  return new Date(`${dateKey}T${time || "00:00"}:00${APP_TIME_ZONE_OFFSET}`);
}

function getRecipientsByCircle(memberships) {
  return memberships.reduce((recipients, membership) => {
    const current = recipients.get(membership.careCircleId) || [];
    current.push(membership.userId);
    recipients.set(membership.careCircleId, current);
    return recipients;
  }, new Map());
}

function buildNotification({ type, source, userId, dateKey, scheduledFor }) {
  const content = {
    MEDICATION: {
      title: "Momento de la medicación",
      message: `${source.name} ${source.dose} está programado para las ${source.schedule}.`,
      url: "/app/medicamentos",
    },
    TASK: {
      title: "Tarea pendiente",
      message: `${source.title} está programada para las ${source.scheduledTime}.`,
      url: "/app/tareas",
    },
    EVENT: {
      title: "Evento programado",
      message: `${source.title} comienza a las ${source.time}.`,
      url: "/app/calendario",
    },
  }[type];

  return {
    careCircleId: source.careCircleId,
    userId,
    type,
    sourceId: source.id,
    occurrenceKey: `${type}:${source.id}:${dateKey}`,
    scheduledFor,
    ...content,
  };
}

export async function materializeUpcomingNotifications(now = new Date()) {
  const todayKey = getNotificationDateKey(now);
  const tomorrowKey = addDays(todayKey, 1);
  const rangeStart = new Date(`${todayKey}T00:00:00Z`);
  const rangeEnd = new Date(`${tomorrowKey}T23:59:59.999Z`);

  const [memberships, medications, tasks, events] = await Promise.all([
    prisma.careCircleMember.findMany({
      where: { role: { in: ["ADMIN", "CAREGIVER"] } },
      select: { careCircleId: true, userId: true },
    }),
    prisma.medication.findMany({
      where: { active: true },
      select: {
        id: true,
        careCircleId: true,
        name: true,
        dose: true,
        schedule: true,
        administrations: {
          where: {
            scheduledFor: {
              gte: getScheduledInstant(todayKey, "00:00"),
              lte: getScheduledInstant(tomorrowKey, "23:59"),
            },
          },
          select: { scheduledFor: true },
        },
      },
    }),
    prisma.careTask.findMany({
      where: {
        completed: false,
        scheduledDate: { gte: rangeStart, lte: rangeEnd },
        scheduledTime: { not: null },
      },
      select: {
        id: true,
        careCircleId: true,
        title: true,
        scheduledDate: true,
        scheduledTime: true,
        assignedToId: true,
      },
    }),
    prisma.calendarEvent.findMany({
      where: { date: { gte: rangeStart, lte: rangeEnd } },
      select: {
        id: true,
        careCircleId: true,
        title: true,
        date: true,
        time: true,
      },
    }),
  ]);

  const recipientsByCircle = getRecipientsByCircle(memberships);
  const eligibleUsers = new Set(memberships.map((membership) => membership.userId));
  const notifications = [];

  for (const medication of medications) {
    for (const dateKey of [todayKey, tomorrowKey]) {
      const scheduledFor = getScheduledInstant(dateKey, medication.schedule);
      const wasAdministered = medication.administrations.some(
        (administration) => getNotificationDateKey(administration.scheduledFor) === dateKey,
      );

      if (wasAdministered) continue;

      for (const userId of recipientsByCircle.get(medication.careCircleId) || []) {
        notifications.push(
          buildNotification({
            type: "MEDICATION",
            source: medication,
            userId,
            dateKey,
            scheduledFor,
          }),
        );
      }
    }
  }

  for (const task of tasks) {
    const dateKey = getStoredDateKey(task.scheduledDate);
    const recipients = task.assignedToId && eligibleUsers.has(task.assignedToId)
      ? [task.assignedToId]
      : recipientsByCircle.get(task.careCircleId) || [];

    for (const userId of recipients) {
      notifications.push(
        buildNotification({
          type: "TASK",
          source: task,
          userId,
          dateKey,
          scheduledFor: getScheduledInstant(dateKey, task.scheduledTime),
        }),
      );
    }
  }

  for (const event of events) {
    const dateKey = getStoredDateKey(event.date);
    for (const userId of recipientsByCircle.get(event.careCircleId) || []) {
      notifications.push(
        buildNotification({
          type: "EVENT",
          source: event,
          userId,
          dateKey,
          scheduledFor: getScheduledInstant(dateKey, event.time),
        }),
      );
    }
  }

  if (notifications.length) {
    const result = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
    return result.count;
  }

  return 0;
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Faltan NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY o VAPID_SUBJECT.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

async function sendToSubscription(subscription, notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: "/cuida-icon-192.png",
    badge: "/cuida-badge-96.png",
    url: notification.url,
    notificationId: notification.id,
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      payload,
    );
    return true;
  } catch (error) {
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await prisma.pushSubscription.deleteMany({ where: { id: subscription.id } });
      return true;
    }

    console.error("No se pudo enviar una notificación Push.", {
      notificationId: notification.id,
      statusCode: error?.statusCode,
    });
    return false;
  }
}

export async function deliverDueNotifications(now = new Date()) {
  configureWebPush();
  const staleClaim = new Date(now.getTime() - CLAIM_TIMEOUT_MS);
  const due = await prisma.notification.findMany({
    where: {
      scheduledFor: { lte: now },
      sentAt: null,
      OR: [{ claimedAt: null }, { claimedAt: { lt: staleClaim } }],
    },
    orderBy: { scheduledFor: "asc" },
    take: 50,
  });

  let delivered = 0;
  for (const notification of due) {
    const claim = await prisma.notification.updateMany({
      where: {
        id: notification.id,
        sentAt: null,
        OR: [{ claimedAt: null }, { claimedAt: { lt: staleClaim } }],
      },
      data: { claimedAt: now },
    });

    if (!claim.count) continue;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: notification.userId },
    });
    const results = await Promise.all(
      subscriptions.map((subscription) => sendToSubscription(subscription, notification)),
    );
    const successful = subscriptions.length === 0 || results.some(Boolean);

    await prisma.notification.update({
      where: { id: notification.id },
      data: successful ? { sentAt: new Date(), claimedAt: null } : { claimedAt: null },
    });

    if (successful) delivered += 1;
  }

  return delivered;
}

export async function cancelPendingNotifications(type, sourceId, occurrenceKey = null) {
  return prisma.notification.deleteMany({
    where: {
      type,
      sourceId,
      sentAt: null,
      ...(occurrenceKey ? { occurrenceKey } : {}),
    },
  });
}
