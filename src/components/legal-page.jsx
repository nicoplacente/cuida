import Image from "next/image";
import { Shell } from "@/components/ui";

export function LegalSection({ children, title }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[color:var(--care-ink)]">
        {title}
      </h2>
      <div className="grid gap-3 leading-7 text-[color:var(--care-ink-soft)]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ children }) {
  return <ul className="grid list-disc gap-2 pl-5 marker:text-[color:var(--care-teal)]">{children}</ul>;
}

export function LegalPage({ children, description, eyebrow, title, updatedAt }) {
  return (
    <div className="min-h-screen bg-[color:var(--care-canvas)]">
      <header className="border-b border-[color:var(--care-cloud)] bg-white">
        <Shell className="flex min-h-20 items-center justify-between gap-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            aria-label="Volver al inicio de Cuida"
          >
            <Image
              src="/cuida-logo.webp"
              alt=""
              width={48}
              height={48}
              className="size-11 object-contain"
              priority
            />
            <div>
              <p className="text-lg leading-5 tracking-[-0.02em]">Cuida</p>
              <p className="mt-1 text-xs font-medium text-[color:var(--care-muted)]">
                Información legal
              </p>
            </div>
          </a>
          <a
            href="/"
            className="rounded-full border border-[color:var(--care-cloud)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Volver al inicio
          </a>
        </Shell>
      </header>

      <main>
        <Shell className="max-w-5xl py-10 sm:py-16">
          <article className="overflow-hidden rounded-2xl border border-[color:var(--care-cloud)] bg-white shadow-[0_18px_60px_rgba(11,31,58,0.06)]">
            <header className="bg-[color:var(--care-ink)] px-6 py-10 text-white sm:px-10 sm:py-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
                {eyebrow}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{description}</p>
              <p className="mt-6 text-sm font-medium text-white/55">
                Última actualización: {updatedAt}
              </p>
            </header>

            <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-12">{children}</div>
          </article>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-[color:var(--care-muted)]">
            Para consultas sobre estos documentos o sobre tus datos, escribinos a{" "}
            <a
              href="mailto:contacto@codeluxe.tech"
              className="font-semibold text-[color:var(--care-ink)] underline decoration-[color:var(--care-teal)] underline-offset-4"
            >
              contacto@codeluxe.tech
            </a>
            .
          </p>
        </Shell>
      </main>
    </div>
  );
}
