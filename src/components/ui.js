export function Shell({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-[color:var(--care-cloud)] bg-white shadow-[0_18px_60px_rgba(11,31,58,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[color:var(--care-ink)] sm:text-4xl">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 text-lg text-[color:var(--care-ink-soft)]">
          {children}
        </p>
      ) : null}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--care-teal)] px-6 py-3 text-base font-semibold text-[color:var(--care-ink)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, className = "", href }) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--care-teal)] px-6 py-3 text-base font-semibold text-[color:var(--care-ink)] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}

export function SecondaryLink({ children, className = "", href }) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--care-cloud)] bg-white px-6 py-3 text-base font-semibold text-[color:var(--care-ink)] transition hover:border-[color:var(--care-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[color:var(--care-ink)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClassName =
  "min-h-12 w-full rounded-xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] px-4 py-3 text-base text-[color:var(--care-ink)] transition placeholder:text-[color:var(--care-muted)] focus:border-[color:var(--care-teal)] focus:bg-white focus:outline-none";

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral:
      "border-[color:var(--care-cloud)] bg-[#f8fbfd] text-[color:var(--care-ink-soft)]",
    teal: "border-transparent bg-[color:var(--care-teal-soft)] text-[color:var(--care-ink)]",
    success: "border-transparent bg-[#e6f7ef] text-[color:var(--care-success)]",
    warning: "border-transparent bg-[#fff4de] text-[color:var(--care-warning)]",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--care-cloud)] bg-[#f8fbfd] p-6 text-center">
      <p className="font-semibold text-[color:var(--care-ink)]">{title}</p>
      {children ? (
        <p className="mt-2 text-sm text-[color:var(--care-muted)]">{children}</p>
      ) : null}
    </div>
  );
}
