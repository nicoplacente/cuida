import { PrismaClient } from "@prisma/client";
import { createSafeServerError } from "../utils/safe-logger.js";

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient({ log: [] }).$extends({
    name: "sanitizedDatabaseErrors",
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          throw createSafeServerError(error, "DATABASE_OPERATION_FAILED");
        }
      },
    },
  });
}

export const prisma =
  globalForPrisma.sanitizedPrisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.sanitizedPrisma = prisma;
}
