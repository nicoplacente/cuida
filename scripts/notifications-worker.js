import "./load-environment.js";
import { setTimeout as wait } from "node:timers/promises";
import { prisma } from "../src/services/db.js";
import {
  configureWebPush,
  deliverDueNotifications,
  materializeUpcomingNotifications,
} from "../src/services/notifications.js";
import { logServerError } from "../src/utils/safe-logger.js";

const POLL_INTERVAL_MS = 30_000;
let stopping = false;

function stop() {
  stopping = true;
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

async function run() {
  configureWebPush();
  await prisma.$queryRaw`SELECT 1`;
  console.log("Worker de notificaciones iniciado.");

  while (!stopping) {
    try {
      const materialized = await materializeUpcomingNotifications();
      const delivered = await deliverDueNotifications();

      if (materialized || delivered) {
        console.log("Ciclo de notificaciones completado.", { materialized, delivered });
      }
    } catch (error) {
      logServerError("notificationsWorker:cycle", error, {
        code: "NOTIFICATION_CYCLE_FAILED",
      });
    }

    if (!stopping) await wait(POLL_INTERVAL_MS);
  }

  await prisma.$disconnect();
  console.log("Worker de notificaciones detenido.");
}

run().catch(async (error) => {
  logServerError("notificationsWorker:fatal", error, {
    code: "NOTIFICATION_WORKER_FAILED",
  });
  await prisma.$disconnect();
  process.exitCode = 1;
});
