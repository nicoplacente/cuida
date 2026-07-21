import Image from "next/image";
import { Badge, Card, LinkButton, SectionTitle, Shell } from "@/components/ui";

const features = [
  "Medicación",
  "Calendario",
  "Tareas compartidas",
  "Historial diario",
  "Documentos",
  "Alertas",
  "Equipo de cuidadores",
];

const problemPoints = [
  "Mensajes importantes perdidos en WhatsApp.",
  "Papeles y recetas difíciles de encontrar.",
  "Recordatorios separados entre familiares.",
  "Riesgo de duplicar medicación o saltear tareas.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[color:var(--care-canvas)]">
      <header className="relative z-40 border-b border-[color:var(--care-cloud)] bg-white/85 backdrop-blur">
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
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[color:var(--care-ink-soft)] md:flex">
            <a href="#solucion" className="hover:text-[color:var(--care-ink)]">
              Solución
            </a>
            <a href="#caracteristicas" className="hover:text-[color:var(--care-ink)]">
              Características
            </a>
            <a href="/login" className="hover:text-[color:var(--care-ink)]">
              Ingresar
            </a>
            <LinkButton href="/registro" className="min-h-10 px-5 py-2 text-sm">
              Comenzar gratis
            </LinkButton>
          </nav>
          <details className="group md:hidden">
            <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-full border border-[color:var(--care-cloud)] bg-white px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              Menú
            </summary>
            <nav className="absolute inset-x-4 top-[calc(100%-4px)] z-30 grid gap-1 rounded-2xl border border-[color:var(--care-cloud)] bg-white p-4 shadow-[0_22px_70px_rgba(11,31,58,0.16)] sm:inset-x-6">
              <a href="#solucion" className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]">
                Solución
              </a>
              <a href="#caracteristicas" className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]">
                Características
              </a>
              <a href="/login" className="rounded-xl px-3 py-3 font-semibold hover:bg-[color:var(--care-canvas)]">
                Ingresar
              </a>
              <LinkButton href="/registro" className="mt-2 w-full">
                Comenzar gratis
              </LinkButton>
            </nav>
          </details>
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
              Organiza medicamentos, turnos, tareas y cuidados diarios de tus
              seres queridos en un solo lugar.
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
                    <Badge tone={status === "Pendiente" ? "warning" : "neutral"}>
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
            <SectionTitle eyebrow="Problema actual" title="Cuidar con información dispersa cansa y aumenta errores.">
              Muchas familias coordinan cuidados con mensajes, papeles y
              recordatorios separados. Eso funciona un tiempo, hasta que algo se
              pierde.
            </SectionTitle>
            <div className="mt-8 grid gap-3">
              {problemPoints.map((point) => (
                <p key={point} className="rounded-2xl bg-[#f8fbfd] p-4 font-medium">
                  {point}
                </p>
              ))}
            </div>
          </Card>

          <Card id="solucion" className="p-8">
            <SectionTitle eyebrow="Solución" title="Cuida centraliza lo importante para todo el equipo.">
              Cada cuidador ve el mismo plan del día, registra lo que hizo y
              deja información clara para quien sigue.
            </SectionTitle>
            <div className="mt-8 rounded-2xl bg-[color:var(--care-ink)] p-6 text-white">
              <p className="text-sm font-semibold text-[color:var(--care-teal)]">
                Impacto social
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
                Una herramienta abierta para cuidar mejor, sin barreras de pago.
              </p>
            </div>
          </Card>
        </Shell>
      </section>

      <section id="caracteristicas" className="bg-white py-20">
        <Shell>
          <SectionTitle eyebrow="Características" title="Todo el cuidado diario en una experiencia simple.">
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
            <LinkButton href="/registro" className="!bg-white !text-[color:var(--care-ink)]">
              Comenzar gratis
            </LinkButton>
          </Card>
        </Shell>
      </section>
    </main>
  );
}
