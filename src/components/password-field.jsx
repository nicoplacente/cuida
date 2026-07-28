"use client";

import { useState } from "react";
import { EyeIcon } from "@/components/icons/eye-icon";
import { EyeOffIcon } from "@/components/icons/eye-off-icon";
import { inputClassName } from "@/components/ui";

export function PasswordField({ className = "", ...props }) {
  const [isVisible, setIsVisible] = useState(false);
  const label = isVisible ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <div className="relative">
      <input
        className={`${inputClassName} pr-12 ${className}`}
        type={isVisible ? "text" : "password"}
        {...props}
      />
      <button
        aria-label={label}
        className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-xl text-[color:var(--care-muted)] transition hover:text-[color:var(--care-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        onClick={() => setIsVisible((visible) => !visible)}
        title={label}
        type="button"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
