import { getCurrentUser } from "@/services/auth";
import { prisma } from "@/services/db";

function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

function isValidSubscription(subscription) {
  if (!subscription || typeof subscription !== "object") return false;
  if (typeof subscription.endpoint !== "string") return false;
  if (!subscription.endpoint.startsWith("https://")) return false;
  if (subscription.endpoint.length > 2048) return false;

  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;
  return (
    typeof p256dh === "string" &&
    p256dh.length <= 512 &&
    typeof auth === "string" &&
    auth.length <= 512
  );
}

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Origen inválido." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const subscription = await request.json().catch(() => null);
  if (!isValidSubscription(subscription)) {
    return Response.json({ error: "Suscripción inválida." }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId: user.id,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return Response.json({ success: true });
}

export async function DELETE(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Origen inválido." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) {
    return Response.json({ error: "Endpoint inválido." }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  return Response.json({ success: true });
}
