import { prisma } from "@/services/db";
import {
  requireUser,
  getActiveCareCircleId,
  getPrimaryCareMembership,
} from "@/services/auth";

export async function requireCareContext() {
  const user = await requireUser();
  const activeCareCircleId = await getActiveCareCircleId();
  const membership = getPrimaryCareMembership(user, activeCareCircleId);
  const careCircle = membership?.careCircle || null;

  if (!careCircle) {
    return { user, careCircle: null, patient: null, membership: null, canManage: false };
  }

  return {
    user,
    careCircle,
    patient: careCircle.patient,
    membership,
    canManage: membership.role === "ADMIN" || membership.role === "CAREGIVER",
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
