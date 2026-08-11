import { prisma } from "@/services/db";
import { createDailyPlan } from "@/utils/daily-plan";
import {
  getEndOfToday,
  getLocalDateKey,
  getStartOfNextDay,
  getStartOfToday,
} from "@/utils/dates";
import { getMedicationOccurrences } from "@/utils/medication-schedules";

export async function getDashboardData(careCircleId) {
  const now = new Date();
  const todayStart = getStartOfToday(now);
  const todayEnd = getEndOfToday(now);
  const todayDateKey = getLocalDateKey(now);

  const [
    medications,
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
        times: { orderBy: { time: "asc" } },
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

  const medicationPlan = medications.flatMap((medication) => {
    const administrations = new Map(
      medication.administrations.map((administration) => [
        administration.scheduledFor.getTime(),
        administration,
      ]),
    );
    return getMedicationOccurrences(medication, todayStart, todayEnd).map((occurrence) => ({
      medication,
      occurrence,
      administration: administrations.get(occurrence.scheduledFor.getTime()) || null,
    }));
  });
  const dailyPlan = createDailyPlan({
    dateKey: todayDateKey,
    events,
    medicationPlan,
    tasks,
  });

  return {
    dailyPlan,
    medications,
    medicationPlan,
    pendingMedications: medicationPlan.filter(({ administration }) => !administration).length,
    tasks,
    pendingTasks: tasks.filter((task) => !task.completed).length,
    events,
    logs,
    activities,
    documents,
    nextDayStartsAt: getStartOfNextDay(now),
    todayStart,
  };
}
