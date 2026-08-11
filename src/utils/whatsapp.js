const mobileUserAgentPattern = /Android|iPhone|iPad|iPod/i;

export function createWhatsAppInvitationMessage(invitation) {
  const role = invitation.roleLabel.toLocaleLowerCase("es-AR");
  return `Te invito a sumarte a nuestro círculo de cuidado en Cuida con el rol de ${role}. Este enlace vence en 60 minutos: ${invitation.link}`;
}

export function getWhatsAppAppShareUrl(message) {
  return `whatsapp://send?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppWebShareUrl(message) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function shouldUseWhatsAppAppLink({
  maxTouchPoints = 0,
  platform = "",
  userAgent = "",
}) {
  const isTouchEnabledIpad = platform === "MacIntel" && maxTouchPoints > 1;
  return mobileUserAgentPattern.test(userAgent) || isTouchEnabledIpad;
}
