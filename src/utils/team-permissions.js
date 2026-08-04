export const CARE_ROLES = Object.freeze(["ADMIN", "CAREGIVER", "OBSERVER"]);

const careRoleSet = new Set(CARE_ROLES);

export function isCareRole(role) {
  return careRoleSet.has(role);
}

export function canLeaveCareCircle({ adminCount, role }) {
  return role !== "ADMIN" || adminCount > 1;
}

export function getNextCareCircleId(careCircleIds, currentCareCircleId) {
  return careCircleIds.find((careCircleId) => careCircleId !== currentCareCircleId) || null;
}
