import { prisma } from "@/services/db";
import {
  requireUser,
  getActiveCareCircleId,
  getPrimaryCareCircle,
} from "@/services/auth";

export async function requireCareContext() {
  const user = await requireUser();
  const activeCareCircleId = await getActiveCareCircleId();
  const careCircle = getPrimaryCareCircle(user, activeCareCircleId);

  if (!careCircle) {
    return { user, careCircle: null, patient: null };
  }

  return {
    user,
    careCircle,
    patient: careCircle.patient,
  };
}

export async function getCareCircleMembers(careCircleId) {
  return prisma.careCircleMember.findMany({
    where: { careCircleId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}
