import Image from "next/image";
import { logoutAction } from "@/app/(auth)/actions";
import { switchCareCircleAction } from "@/features/care-circles/actions";
import { requireCareContext } from "@/services/care-circle";
import { CareCircleSwitcher } from "@/components/care-circle-switcher";
import { SecondaryLink } from "@/components/ui";
import { NotificationCenter } from "@/components/notification-center";
import { LogoutIcon } from "@/components/icons/logout-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { ToastForm } from "@/components/toast-form";
import { SessionKeeper } from "@/components/session-keeper";
import { prisma } from "@/services/db";

const navigation = [
  { href: "/app", label: "Inicio" },
  { href: "/app/medicamentos", label: "Medicamentos" },
  { href: "/app/tareas", label: "Tareas" },
  { href: "/app/calendario", label: "Calendario" },
  { href: "/app/historial", label: "Historial" },
  { href: "/app/documentos", label: "Documentos" },
  { href: "/app/equipo", label: "Equipo" },
  { href: "/app/asistente", label: "Asistente" },
];

export async function AppShell({ children }) {
  const { user, careCircle, patient } = await requireCareContext();
  const careCircleOptions = user.memberships.map((membership) => ({
    id: membership.careCircle.id,
    name: membership.careCircle.name,
  }));
  const now = new Date();
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(careCircle ? { careCircleId: careCircle.id } : {}),
        scheduledFor: { lte: now },
      },
      orderBy: [{ readAt: "asc" }, { scheduledFor: "desc" }],
      take: 12,
    }),
    prisma.notification.count({
      where: {
        userId: user.id,
        ...(careCircle ? { careCircleId: careCircle.id } : {}),
        readAt: null,
        scheduledFor: { lte: now },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[color:var(--care-canvas)]">
      <SessionKeeper />
      <header className="sticky top-0 z-20 border-b border-[color:var(--care-cloud)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="/app" className="flex items-center gap-3">
            <Image
              src="/cuida.png"
              alt="Logo de Cuida"
              width={44}
              height={44}
              className="rounded-2xl"
              priority
            />
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em]">Cuida</p>
              <p className="text-xs font-semibold text-[color:var(--care-muted)]">
                {careCircle?.name || "Sin círculo activo"}
              </p>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              publicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""}
            />
            <div className="hidden items-center gap-3 lg:flex">
            {user.memberships.length > 1 ? (
              <CareCircleSwitcher
                action={switchCareCircleAction}
                careCircles={careCircleOptions}
                activeCareCircleId={careCircle?.id}
              />
            ) : null}
            <SecondaryLink
              href="/app/circulos/nuevo"
              className="hidden min-h-10 px-4 py-2 text-sm sm:inline-flex"
            >
              Nuevo círculo
            </SecondaryLink>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-[color:var(--care-muted)]">
                {patient?.name ? `Cuidando a ${patient.name}` : "Administrador"}
              </p>
            </div>
            <ToastForm action={logoutAction}>
              <button
                aria-label="Cerrar sesión"
                className="flex size-10 items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)]"
                title="Cerrar sesión"
                type="submit"
              >
                <LogoutIcon />
              </button>
            </ToastForm>
            </div>

            <details name="app-header-popover" className="group relative lg:hidden">
              <summary
                aria-label="Abrir menú de navegación"
                className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)] [&::-webkit-details-marker]:hidden"
                title="Abrir menú de navegación"
              >
                <MenuIcon />
              </summary>
              <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)] rounded-2xl border border-[color:var(--care-cloud)] bg-white p-4 shadow-[0_22px_70px_rgba(11,31,58,0.16)]">
                <div className="rounded-xl bg-[color:var(--care-canvas)] p-4">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-[color:var(--care-muted)]">
                    {patient?.name ? `Cuidando a ${patient.name}` : "Administrador"}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[color:var(--care-ink-soft)]">
                    {careCircle?.name || "Sin círculo activo"}
                  </p>
                </div>

                {user.memberships.length > 1 ? (
                  <div className="mt-3">
                    <CareCircleSwitcher
                      action={switchCareCircleAction}
                      careCircles={careCircleOptions}
                      activeCareCircleId={careCircle?.id}
                      className="block"
                    />
                  </div>
                ) : null}

                <nav className="mt-3 grid gap-1" aria-label="Navegación móvil">
                  {navigation.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[color:var(--care-ink-soft)] transition hover:bg-[color:var(--care-canvas)] hover:text-[color:var(--care-ink)]"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-3 grid gap-2 border-t border-[color:var(--care-cloud)] pt-3">
                  <SecondaryLink href="/app/circulos/nuevo" className="min-h-10 px-4 py-2 text-sm">
                    Nuevo círculo
                  </SecondaryLink>
                  <ToastForm action={logoutAction}>
                    <button
                      aria-label="Cerrar sesión"
                      className="mx-auto flex size-10 items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white text-[color:var(--care-ink-soft)] transition hover:border-[color:var(--care-teal)] hover:text-[color:var(--care-ink)]"
                      title="Cerrar sesión"
                      type="submit"
                    >
                      <LogoutIcon />
                    </button>
                  </ToastForm>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 grid gap-2">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--care-ink-soft)] transition hover:bg-white hover:text-[color:var(--care-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
