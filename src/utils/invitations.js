export const invitationValidityMilliseconds = 60 * 60 * 1000;

const invitationTokenPattern = /^[a-f0-9]{64}$/;

const invitationRoleLabels = {
  CAREGIVER: "Cuidador",
  OBSERVER: "Observador",
};

export function createInvitationExpiration(createdAt = new Date()) {
  return new Date(createdAt.getTime() + invitationValidityMilliseconds);
}

export function getInvitationRoleLabel(role) {
  return invitationRoleLabels[role] || "Miembro";
}

export function isInvitationExpired(expiresAt, now = new Date()) {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export function isValidInvitationToken(token) {
  return invitationTokenPattern.test(token);
}
