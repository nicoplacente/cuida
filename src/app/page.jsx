import Image from "next/image";
import { InstallAppButton } from "@/components/install-app-button";
import { LandingFooter } from "@/components/landing-footer";
import { MobileLandingNavigation } from "@/components/mobile-landing-navigation";
import { Badge, Card, LinkButton, SectionTitle, Shell } from "@/components/ui";
import { getDonationUrl } from "@/utils/donation-url";
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  createLandingJsonLd,
  createPublicMetadata,
  serializeJsonLd,
} from "@/utils/seo";

export const metadata = createPublicMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

const features = [
  "Medicación",
  "Calendario",
  "Tareas compartidas",
  "Historial diario",
  "Documentos",
  "Historia clínica",
  "Equipo de cuidadores",
  "Juegos",
];

const problemPoints = [
  "Mensajes importantes perdidos en WhatsApp.",
  "Papeles y recetas difíciles de encontrar.",
  "Recordatorios separados entre familiares.",
  "Riesgo de duplicar medicación o saltear tareas.",
];

export default function Home() {
  const donationUrl = getDonationUrl();
  const jsonLd = createLandingJsonLd();

  return (
    <main id="inicio" className="min-h-screen bg-[color:var(--care-canvas)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <header className="sticky top-0 z-50 border-b border-[color:var(--care-cloud)] bg-white/90 backdrop-blur">
        <Shell className="relative flex min-h-20 items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 font-semibold">
            <Image
              src="/cuida.png"
              alt="Logo de Cuida"
              width={44}
              height={44}
              className="rounded-2xl"
              priority
            />
            <span className="text-xl tracking-[-0.02em]">Cuida</span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-[color:var(--care-ink-soft)] lg:flex">
            <a href="#solucion" className="hover:text-[color:var(--care-ink)]">
              Solución
            </a>
            <a
              href="#caracteristicas"
              className="hover:text-[color:var(--care-ink)]"
            >
              Características
            </a>
            {donationUrl ? (
              <a
                href="#donaciones"
                className="hover:text-[color:var(--care-ink)]"
              >
                Donar
              </a>
            ) : null}
            <InstallAppButton className="whitespace-nowrap" />
            <a href="/login" className="hover:text-[color:var(--care-ink)]">
              Ingresar
            </a>
            <LinkButton href="/registro" className="min-h-10 px-5 py-2 text-sm">
              Comenzar gratis
            </LinkButton>
          </nav>
          <MobileLandingNavigation showDonations={Boolean(donationUrl)} />
        </Shell>
      </header>

      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#dffafa,rgba(255,255,255,0))]" />
        <Shell className="relative grid min-h-[calc(100vh-80px)] items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div>
            <Badge tone="teal">Gratis y open source</Badge>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--care-ink)] sm:text-6xl lg:text-7xl">
              Cuidar juntos ahora es más fácil
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[color:var(--care-ink-soft)]">
              Organizá de forma simple cada aspecto del cuidado: rutinas,
              medicamentos, turnos, tareas, información importante y el trabajo
              compartido entre quienes la acompañan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/registro">Comenzar gratis</LinkButton>
            </div>
          </div>

          <Card className="mx-auto w-full max-w-md p-4">
            <div className="rounded-[1.25rem] bg-[color:var(--care-canvas)] p-4">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                <Image
                  src="/cuida-full.png"
                  alt="Marca Cuida"
                  width={72}
                  height={72}
                  className="rounded-2xl object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                    Hoy María tiene
                  </p>
                  <p className="text-2xl font-semibold tracking-[-0.02em]">
                    8 cuidados activos
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["08:00", "Donepezilo 10 mg", "Pendiente"],
                  ["16:00", "Consulta neurológica", "Turno"],
                  ["20:00", "Preparar cena", "Tarea"],
                ].map(([time, title, status]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4"
                  >
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-[color:var(--care-muted)]">
                        {time}
                      </p>
                    </div>
                    <Badge
                      tone={status === "Pendiente" ? "warning" : "neutral"}
                    >
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Shell>
      </section>

      <section className="py-20">
        <Shell className="grid gap-8 lg:grid-cols-2">
          <Card className="p-8">
            <SectionTitle
              eyebrow="Problema actual"
              title="Cuidar a una persona con deterioro cognitivo implica coordinar muchas cosas."
            >
              Muchas familias coordinan cuidados con mensajes, papeles y
              recordatorios separados. Eso funciona un tiempo, hasta que algo se
              pierde.
            </SectionTitle>
            <div className="mt-8 grid gap-3">
              {problemPoints.map((point) => (
                <p
                  key={point}
                  className="rounded-2xl bg-[#f8fbfd] p-4 font-medium"
                >
                  {point}
                </p>
              ))}
            </div>
          </Card>

          <Card id="solucion" className="scroll-mt-28 p-8">
            <SectionTitle
              eyebrow="Solución"
              title="Que la información esté disponible en un solo lugar hace toda la diferencia."
            >
              Cada cuidador ve el mismo plan del día, registra lo que hizo y
              deja información clara. Todo en un solo lugar para que todos sepan
              qué hacer y cuándo hacerlo.
            </SectionTitle>
            <div className="mt-8 rounded-2xl bg-[color:var(--care-ink)] p-6 text-white">
              <p className="text-sm font-semibold text-[color:var(--care-teal)]">
                Impacto social
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
                Una herramienta simple para cuidar mejor, gratis y a un solo
                clic.
              </p>
            </div>
          </Card>
        </Shell>
      </section>

      <section id="caracteristicas" className="scroll-mt-20 bg-white py-20">
        <Shell>
          <SectionTitle
            eyebrow="Características"
            title="Todo el cuidado diario en una experiencia simple."
          >
            Diseñada para familias, cuidadores y personas que necesitan una
            coordinación clara, humana y accesible.
          </SectionTitle>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature} className="p-6">
                <div className="mb-5 h-2 w-14 rounded-full bg-[color:var(--care-teal)]" />
                <h3 className="text-xl font-semibold tracking-[-0.02em]">
                  {feature}
                </h3>
              </Card>
            ))}
          </div>
        </Shell>
      </section>

      <section className="py-20">
        <Shell>
          <Card className="grid gap-6 overflow-hidden !bg-[color:var(--care-ink)] p-8 !text-white lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
                Comunidad
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Cuida será gratuito, open source y pensado para ayudar.
              </h2>
              <p className="mt-4 max-w-2xl text-white/85">
                El objetivo es construir una plataforma profesional de impacto
                social, preparada para crecer con nuevas integraciones, app
                mobile y asistencia inteligente.
              </p>
            </div>
            <LinkButton
              href="/registro"
              className="!bg-white !text-[color:var(--care-ink)]"
            >
              Comenzar gratis
            </LinkButton>
          </Card>
        </Shell>
      </section>

      {donationUrl ? (
        <section id="donaciones" className="scroll-mt-20 bg-white py-20">
          <Shell>
            <Card className="grid gap-8 overflow-hidden p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <SectionTitle
                eyebrow="Sostener Cuida"
                title="Si Cuida te ayuda, podés ayudarnos a mantenerla disponible."
              >
                Cuida seguirá siendo gratuita. Si querés colaborar, tu aporte
                nos ayuda a cubrir los servidores que hoy sostenemos nosotros.
                No es obligatorio: cualquier ayuda, del monto que elijas, suma.
              </SectionTitle>
              <LinkButton
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Donar por Mercado Pago (se abre en una pestaña nueva)"
                className="w-full sm:w-fit"
              >
                Donar por Mercado Pago
              </LinkButton>
            </Card>
          </Shell>
        </section>
      ) : null}

      <section className="border-t border-[color:var(--care-cloud)] py-20">
        <Shell>
          <Card className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <SectionTitle
              eyebrow="Mejoramos juntos"
              title="¿Encontraste un error en Cuida?"
            >
              Contanos qué pasó en GitHub. Tu reporte nos ayuda a corregir
              problemas y a mejorar la experiencia para toda la comunidad.
            </SectionTitle>
            <LinkButton
              href="https://github.com/nicoplacente/cuida/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reportar un error en GitHub (se abre en una pestaña nueva)"
              className="w-full sm:w-fit"
            >
              Reportar un error
            </LinkButton>
          </Card>
        </Shell>
      </section>
      <LandingFooter showDonations={Boolean(donationUrl)} />
    </main>
  );
}
