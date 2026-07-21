"use client";

import { useRef } from "react";

export function CareCircleSwitcher({
  action,
  careCircles,
  activeCareCircleId,
  className = "hidden sm:block",
}) {
  const formRef = useRef(null);

  return (
    <form ref={formRef} action={action} className={className}>
      <label className="sr-only" htmlFor="careCircleId">
        Cambiar círculo de cuidado
      </label>
      <select
        id="careCircleId"
        name="careCircleId"
        defaultValue={activeCareCircleId || ""}
        className="min-h-10 w-full rounded-full border border-[color:var(--care-cloud)] bg-white px-4 text-sm font-semibold text-[color:var(--care-ink)]"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {careCircles.map((careCircle) => (
          <option key={careCircle.id} value={careCircle.id}>
            {careCircle.name}
          </option>
        ))}
      </select>
    </form>
  );
}
