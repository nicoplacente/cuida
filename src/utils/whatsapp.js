const mobileUserAgentPattern = /Android|iPhone|iPad|iPod/i;

export function createWhatsAppInvitationMessage(invitation) {
  return `Hola${invitation.name ? `, ${invitation.name}` : ""}. Te invito a sumarte a nuestro círculo de cuidado en Cuida: ${invitation.link}`;
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
