import Image from "next/image";
import { Shell } from "@/components/ui";

const productLinks = [
  { href: "/#solucion", label: "Solución" },
  { href: "/#caracteristicas", label: "Características" },
  { href: "/app", label: "Abrir Cuida" },
];

const accountLinks = [
  { href: "/login", label: "Ingresar" },
  { href: "/registro", label: "Crear una cuenta" },
  { href: "/olvide-contrasena", label: "Recuperar contraseña" },
];

const communityLinks = [
  {
    external: true,
    href: "https://github.com/nicoplacente/cuida",
    label: "Código fuente",
  },
  {
    external: true,
    href: "https://github.com/nicoplacente/cuida/issues/new",
    label: "Reportar un error",
  },
  {
    external: true,
    href: "https://codeluxe.tech",
    label: "Conocer Codeluxe",
  },
];

const legalLinks = [
  { href: "/terminos-y-condiciones", label: "Términos y condiciones" },
  { href: "/politica-de-privacidad", label: "Política de privacidad" },
  { href: "mailto:contacto@codeluxe.tech", label: "Contacto" },
];

function FooterNavigation({ links, title }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {title}
      </h2>
      <ul className="mt-4 grid gap-3 text-sm text-white/70">
        {links.map(({ external, href, label }) => (
          <li key={href}>
            <a
              href={href}
              className="inline-flex rounded-sm transition hover:text-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              {...(external
                ? {
                    "aria-label": `${label} (se abre en una pestaña nueva)`,
                    rel: "noopener noreferrer",
                    target: "_blank",
                  }
                : {})}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LandingFooter({ showDonations = false }) {
  const currentYear = new Date().getFullYear();
  const visibleProductLinks = showDonations
    ? [
        ...productLinks.slice(0, 2),
        { href: "/#donaciones", label: "Donar" },
        ...productLinks.slice(2),
      ]
    : productLinks;

  return (
    <footer className="bg-[color:var(--care-ink)] text-white">
      <Shell className="py-12 sm:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_repeat(4,minmax(0,0.65fr))]">
          <div className="max-w-sm">
            <a
              href="/"
              className="inline-flex items-center gap-4 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              aria-label="Ir al inicio de Cuida"
            >
              <Image
                src="/cuida-logo.webp"
                alt=""
                width={68}
                height={68}
                className="size-16 object-contain"
              />
              <div>
                <p className="text-2xl font-semibold tracking-[-0.03em]">Cuida</p>
                <p className="mt-0.5 text-sm text-white/65">Cuidado compartido</p>
              </div>
            </a>

            <p className="mt-6 text-sm leading-6 text-white/70">
              Una plataforma gratuita y de código abierto para que familias y
              cuidadores organicen el día a día en un solo lugar.
            </p>

            <a
              href="https://codeluxe.tech"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar Codeluxe, creadora de Cuida (se abre en una pestaña nueva)"
              className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 pr-4 transition hover:border-[color:var(--care-teal)] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Image
                src="/logo-cd-3d.png"
                alt="Logo de Codeluxe"
                width={52}
                height={52}
                className="size-12 rounded-xl object-cover"
              />
              <span>
                <span className="block text-xs font-medium text-white/55">Creada por</span>
                <span className="block font-semibold text-white">Codeluxe</span>
              </span>
            </a>
          </div>

          <FooterNavigation title="Producto" links={visibleProductLinks} />
          <FooterNavigation title="Cuenta" links={accountLinks} />
          <FooterNavigation title="Comunidad" links={communityLinks} />
          <FooterNavigation title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs leading-5 text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Cuida. Creada con propósito por Codeluxe.</p>
          <p>Cuida acompaña la organización del cuidado; no reemplaza atención médica.</p>
        </div>
      </Shell>
    </footer>
  );
}
