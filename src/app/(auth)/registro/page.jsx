import Image from "next/image";
import { registerAction } from "@/app/(auth)/actions";
import { Card, Field, PrimaryButton, SecondaryLink, inputClassName } from "@/components/ui";

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
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
              Configura el primer paciente y tu usuario administrador.
            </p>
          </div>
        </div>

        {error ? (
          <p className="mb-5 rounded-2xl bg-[#fff4de] p-4 text-sm font-semibold text-[color:var(--care-warning)]">
            {error}
          </p>
        ) : null}

        <form action={registerAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tu nombre">
              <input className={inputClassName} name="name" required />
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
          <Field label="Contraseña">
            <input
              className={inputClassName}
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Field label="Nombre de la persona cuidada">
              <input className={inputClassName} name="patientName" required />
            </Field>
            <Field label="Edad">
              <input
                className={inputClassName}
                type="number"
                name="patientAge"
                min="1"
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
          <PrimaryButton type="submit" className="mt-2 w-full">
            Comenzar gratis
          </PrimaryButton>
        </form>

        <div className="mt-6 text-center">
          <SecondaryLink href="/login">Ya tengo cuenta</SecondaryLink>
        </div>
      </Card>
    </main>
  );
}
