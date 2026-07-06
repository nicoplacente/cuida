import { prisma } from "@/services/db";

export async function createActivity({ careCircleId, userId, type, message }) {
  return prisma.activity.create({
    data: {
      careCircleId,
      userId,
      type,
      message,
    },
  });
}
