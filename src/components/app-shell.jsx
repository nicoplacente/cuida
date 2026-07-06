import Image from "next/image";
import { logoutAction } from "@/app/(auth)/actions";
import { switchCareCircleAction } from "@/features/care-circles/actions";
import { requireCareContext } from "@/services/care-circle";
import { CareCircleSwitcher } from "@/components/care-circle-switcher";
import { SecondaryLink } from "@/components/ui";

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

const mobileNavigation = [
  { href: "/app", label: "Inicio" },
  { href: "/app/medicamentos", label: "Medicamentos" },
  { href: "/app/tareas", label: "Tareas" },
  { href: "/app/equipo", label: "Equipo" },
  { href: "/app/circulos/nuevo", label: "Nuevo" },
];

export async function AppShell({ children }) {
  const { user, careCircle, patient } = await requireCareContext();
  const careCircleOptions = user.memberships.map((membership) => ({
    id: membership.careCircle.id,
    name: membership.careCircle.name,
  }));

  return (
    <div className="min-h-screen bg-[color:var(--care-canvas)] pb-24 lg:pb-0">
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

          <div className="flex items-center gap-3">
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
            <form action={logoutAction}>
              <button
                className="rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--care-teal)]"
                type="submit"
              >
                Salir
              </button>
            </form>
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

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--care-cloud)] bg-white px-2 py-2 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileNavigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl px-2 py-3 text-center text-xs font-semibold text-[color:var(--care-ink-soft)] transition hover:bg-[color:var(--care-canvas)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
