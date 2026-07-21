import { setTimeout as wait } from "node:timers/promises";
import { prisma } from "../src/services/db.js";
import {
  deliverDueNotifications,
  materializeUpcomingNotifications,
} from "../src/services/notifications.js";

const POLL_INTERVAL_MS = 30_000;
let stopping = false;

function stop() {
  stopping = true;
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

async function run() {
  console.log("Worker de notificaciones iniciado.");

  while (!stopping) {
    try {
      const materialized = await materializeUpcomingNotifications();
      const delivered = await deliverDueNotifications();

      if (materialized || delivered) {
        console.log("Ciclo de notificaciones completado.", { materialized, delivered });
      }
    } catch (error) {
      console.error("Falló el ciclo de notificaciones.", error);
    }

    if (!stopping) await wait(POLL_INTERVAL_MS);
  }

  await prisma.$disconnect();
  console.log("Worker de notificaciones detenido.");
}

run().catch(async (error) => {
  console.error("El worker de notificaciones se detuvo.", error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
