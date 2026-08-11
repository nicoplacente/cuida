import Image from "next/image";
import { registerAction } from "@/app/(auth)/actions";
import { PasswordField } from "@/components/password-field";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { Card, Field, SecondaryLink, inputClassName } from "@/components/ui";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-[min(100%,42rem)] p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/cuida.png"
            alt="Logo de Cuida"
            width={48}
            height={48}
            className="rounded-2xl"
            priority
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Crear tu círculo de cuidado
            </h1>
            <p className="text-sm text-[color:var(--care-muted)]">
              Configurá el primer paciente y tu usuario administrador.
            </p>
          </div>
        </div>

        <ToastForm action={registerAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo">
              <input
                className={inputClassName}
                name="name"
                autoComplete="name"
                required
              />
            </Field>
            <Field label="Email">
              <input
                className={inputClassName}
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </Field>
          </div>
          <Field label="Contraseña" htmlFor="register-password">
            <PasswordField
              id="register-password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre de la persona cuidada">
              <input className={inputClassName} name="patientName" required />
            </Field>
            <Field label="Fecha de nacimiento">
              <input
                className={inputClassName}
                type="date"
                name="birthDate"
                required
              />
            </Field>
          </div>
          <Field label="Condición médica opcional">
            <input
              className={inputClassName}
              name="medicalCondition"
              placeholder="Ejemplo: Alzheimer etapa inicial"
            />
          </Field>
          <SubmitButton pendingLabel="Creando cuenta…" className="mt-2 w-full">
            Comenzar gratis
          </SubmitButton>
        </ToastForm>

        <div className="mt-6 text-center">
          <SecondaryLink href="/login">Ya tengo cuenta</SecondaryLink>
        </div>
      </Card>
    </main>
  );
}
