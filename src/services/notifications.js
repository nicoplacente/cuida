import webpush from "web-push";
import { prisma } from "./db.js";
import { logServerError, SafeServerError } from "../utils/safe-logger.js";
import {
  buildNotificationOccurrenceKey,
  getReminderScheduledFor,
} from "../utils/reminders.js";
import { getMedicationOccurrences, HOUR_MS } from "../utils/medication-schedules.js";

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

export function getCareContextsByCircle(memberships) {
  const contexts = new Map();

  for (const membership of memberships) {
    const current = contexts.get(membership.careCircleId) || {
      patientName: membership.careCircle.patient?.name || membership.careCircle.name,
      recipientIds: [],
    };
    current.recipientIds.push(membership.userId);
    contexts.set(membership.careCircleId, current);
  }

  return contexts;
}

export function buildNotification({
  type,
  kind = "REMINDER",
  source,
  patientName,
  userId,
  dateKey,
  occurrenceLabel,
  occurrenceTime,
  reminderMinutes,
}) {
  const careSubject = patientName || "la persona cuidada";
  const reminderContent = {
    MEDICATION: {
      title: "Momento de la medicación en Cuida",
      message: `Para ${careSubject}: ${source.name} ${source.dose} está programado para las ${occurrenceLabel}.`,
      url: "/app/medicamentos",
    },
    TASK: {
      title: source.title,
      message: `Para ${careSubject}: esta tarea está programada para las ${source.scheduledTime}.`,
      url: "/app/tareas",
    },
    EVENT: {
      title: source.title,
      message: `Para ${careSubject}: este evento comienza a las ${source.time}.`,
      url: "/app/calendario",
    },
  }[type];
  const missedContent = {
    MEDICATION: {
      title: "Medicamento sin administrar en Cuida",
      message: `Para ${careSubject}: ${source.name} ${source.dose} debía administrarse a las ${occurrenceLabel} y continúa pendiente una hora después.`,
      url: "/app/medicamentos",
    },
    TASK: {
      title: source.title,
      message: `Para ${careSubject}: esta tarea debía realizarse a las ${source.scheduledTime} y continúa pendiente una hora después.`,
      url: "/app/tareas",
    },
    EVENT: {
      title: source.title,
      message: `Para ${careSubject}: este evento debía realizarse a las ${source.time} y continúa pendiente una hora después.`,
      url: "/app/calendario",
    },
  }[type];
  const content = kind === "MISSED" ? missedContent : reminderContent;
  const keyMinutes = kind === "MISSED" ? 60 : reminderMinutes;

  return {
    careCircleId: source.careCircleId,
    userId,
    type,
    kind,
    sourceId: source.id,
    occurrenceKey: buildNotificationOccurrenceKey({
      type,
      kind,
      sourceId: source.id,
      dateKey,
      time: occurrenceLabel,
      reminderMinutes: keyMinutes,
    }),
    occurrenceFor: occurrenceTime,
    scheduledFor: kind === "MISSED"
      ? new Date(occurrenceTime.getTime() + HOUR_MS)
      : getReminderScheduledFor(occurrenceTime, reminderMinutes),
    ...content,
  };
}

function appendOccurrenceNotifications({
  notifications,
  type,
  source,
  patientName,
  dateKey,
  occurrenceLabel,
  occurrenceTime,
  reminderRecipients,
  missedRecipients,
  now,
}) {
  if (source.reminderMinutes > 0 && occurrenceTime > now) {
    for (const userId of reminderRecipients) {
      notifications.push(
        buildNotification({
          type,
          source,
          patientName,
          userId,
          dateKey,
          occurrenceLabel,
          occurrenceTime,
          reminderMinutes: source.reminderMinutes,
        }),
      );
    }
  }

  for (const userId of missedRecipients) {
    notifications.push(
      buildNotification({
        type,
        kind: "MISSED",
        source,
        patientName,
        userId,
        dateKey,
        occurrenceLabel,
        occurrenceTime,
        reminderMinutes: source.reminderMinutes,
      }),
    );
  }
}

export async function materializeUpcomingNotifications(now = new Date()) {
  const todayKey = getNotificationDateKey(now);
  const yesterdayKey = addDays(todayKey, -1);
  const tomorrowKey = addDays(todayKey, 1);
  const rangeStart = new Date(`${yesterdayKey}T00:00:00Z`);
  const rangeEnd = new Date(`${tomorrowKey}T23:59:59.999Z`);
  const occurrenceRangeStart = getScheduledInstant(yesterdayKey, "00:00");
  const occurrenceRangeEnd = getScheduledInstant(tomorrowKey, "23:59");

  const [memberships, medications, tasks, events] = await Promise.all([
    prisma.careCircleMember.findMany({
      where: { role: { in: ["ADMIN", "CAREGIVER"] } },
      select: {
        careCircleId: true,
        userId: true,
        careCircle: {
          select: {
            name: true,
            patient: { select: { name: true } },
          },
        },
      },
    }),
    prisma.medication.findMany({
      where: { active: true },
      select: {
        id: true,
        careCircleId: true,
        name: true,
        dose: true,
        schedule: true,
        scheduleType: true,
        startDate: true,
        endDate: true,
        intervalHours: true,
        dailyDoseCount: true,
        reminderMinutes: true,
        times: { select: { time: true }, orderBy: { time: "asc" } },
        administrations: {
          where: {
            scheduledFor: {
              gte: occurrenceRangeStart,
              lte: occurrenceRangeEnd,
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
        reminderMinutes: true,
        assignedToId: true,
      },
    }),
    prisma.calendarEvent.findMany({
      where: { completed: false, date: { gte: rangeStart, lte: rangeEnd } },
      select: {
        id: true,
        careCircleId: true,
        title: true,
        date: true,
        time: true,
        reminderMinutes: true,
      },
    }),
  ]);

  const careContextsByCircle = getCareContextsByCircle(memberships);
  const eligibleUsers = new Set(memberships.map((membership) => membership.userId));
  const notifications = [];

  for (const medication of medications) {
    const administeredTimestamps = new Set(
      medication.administrations.map(({ scheduledFor }) => scheduledFor.getTime()),
    );
    const occurrences = getMedicationOccurrences(
      medication,
      occurrenceRangeStart,
      occurrenceRangeEnd,
    );

    for (const occurrence of occurrences) {
      const wasAdministered = administeredTimestamps.has(occurrence.scheduledFor.getTime());

      if (wasAdministered) continue;
      const careContext = careContextsByCircle.get(medication.careCircleId);
      const recipients = careContext?.recipientIds || [];
      appendOccurrenceNotifications({
        notifications,
        type: "MEDICATION",
        source: medication,
        patientName: careContext?.patientName,
        dateKey: occurrence.dateKey,
        occurrenceLabel: occurrence.time,
        occurrenceTime: occurrence.scheduledFor,
        reminderRecipients: recipients,
        missedRecipients: recipients,
        now,
      });
    }
  }

  for (const task of tasks) {
    const dateKey = getStoredDateKey(task.scheduledDate);
    const careContext = careContextsByCircle.get(task.careCircleId);
    const reminderRecipients = task.assignedToId && eligibleUsers.has(task.assignedToId)
      ? [task.assignedToId]
      : careContext?.recipientIds || [];
    appendOccurrenceNotifications({
      notifications,
      type: "TASK",
      source: task,
      patientName: careContext?.patientName,
      dateKey,
      occurrenceLabel: task.scheduledTime,
      occurrenceTime: getScheduledInstant(dateKey, task.scheduledTime),
      reminderRecipients,
      missedRecipients: careContext?.recipientIds || [],
      now,
    });
  }

  for (const event of events) {
    const dateKey = getStoredDateKey(event.date);
    const careContext = careContextsByCircle.get(event.careCircleId);
    const recipients = careContext?.recipientIds || [];
    appendOccurrenceNotifications({
      notifications,
      type: "EVENT",
      source: event,
      patientName: careContext?.patientName,
      dateKey,
      occurrenceLabel: event.time,
      occurrenceTime: getScheduledInstant(dateKey, event.time),
      reminderRecipients: recipients,
      missedRecipients: recipients,
      now,
    });
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

export function validateNotificationEnvironment() {
  const requiredVariables = [
    "DATABASE_URL",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
  ];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length) {
    throw new SafeServerError("NOTIFICATION_CONFIGURATION_ERROR");
  }
}

export function configureWebPush() {
  validateNotificationEnvironment();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

async function sendToSubscription(subscription, notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: "/cuida-icon-192.png",
    badge: "/cuida-badge-96.png",
    lang: "es-AR",
    url: notification.url,
    notificationId: notification.id,
    timestamp: notification.scheduledFor.getTime(),
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

    logServerError("pushNotification:send", error, {
      code: "PUSH_DELIVERY_FAILED",
      status: error?.statusCode,
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
