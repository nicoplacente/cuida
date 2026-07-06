export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--care-teal)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--care-ink)] sm:text-4xl">
        {title}
      </h1>
      {children ? (
        <p className="mt-3 max-w-2xl text-[color:var(--care-ink-soft)]">
          {children}
        </p>
      ) : null}
    </div>
  );
}
