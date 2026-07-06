import { prisma } from "@/services/db";
import { getEndOfToday, getStartOfToday } from "@/utils/dates";

export async function getDashboardData(careCircleId) {
  const todayStart = getStartOfToday();
  const todayEnd = getEndOfToday();

  const [
    medications,
    administeredToday,
    tasks,
    events,
    logs,
    activities,
    documents,
  ] = await Promise.all([
    prisma.medication.findMany({
      where: { careCircleId, active: true },
      orderBy: { schedule: "asc" },
      include: {
        administrations: {
          where: {
            scheduledFor: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.medicationAdministration.count({
      where: {
        medication: { careCircleId },
        scheduledFor: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.careTask.findMany({
      where: { careCircleId },
      include: {
        assignedTo: { select: { name: true } },
        completedBy: { select: { name: true } },
      },
      orderBy: [{ completed: "asc" }, { scheduledTime: "asc" }],
    }),
    prisma.calendarEvent.findMany({
      where: {
        careCircleId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    }),
    prisma.dailyLog.findMany({
      where: { careCircleId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 8,
    }),
    prisma.activity.findMany({
      where: { careCircleId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.document.findMany({
      where: { careCircleId },
      include: {
        uploadedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    medications,
    administeredToday,
    pendingMedications: Math.max(medications.length - administeredToday, 0),
    tasks,
    pendingTasks: tasks.filter((task) => !task.completed).length,
    events,
    logs,
    activities,
    documents,
  };
}
