export const careRecordPrimaryActionClassName =
  "!min-h-10 w-full !px-4 !py-2 !text-sm sm:!min-h-12 sm:w-auto sm:!px-6 sm:!py-3 sm:!text-base";

const metaPositionClassNames = {
  below: "col-span-2 row-start-2 justify-self-start",
  leading: "col-start-1 row-start-1 justify-self-start",
  trailing: "col-start-2 row-start-1 justify-self-end",
};

export function CareRecordAction({ children, primary = false }) {
  return (
    <div
      className={`min-w-0 [&>button]:w-full [&>form]:w-full sm:contents sm:[&>button]:w-auto sm:[&>form]:w-auto ${
        primary ? "order-first col-span-2 sm:order-none sm:col-span-1" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function CareRecordMetaItem({ children, position }) {
  return (
    <div className={`min-w-0 ${metaPositionClassNames[position]} sm:contents`}>
      {children}
    </div>
  );
}

export function CareRecordCard({
  actions,
  children,
  footer,
  header,
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4">
      <div className="grid min-w-0 gap-4">
        {header ? (
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap">
            {header}
          </div>
        ) : null}

        {actions ? (
          <div className="grid max-w-full grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap sm:justify-start">
            {actions}
          </div>
        ) : null}

        <div className="min-w-0 break-words">{children}</div>

        {footer ? (
          <div className="grid min-w-0 gap-3 border-t border-[color:var(--care-cloud)] pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </article>
  );
}
