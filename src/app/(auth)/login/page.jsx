import Image from "next/image";
import { loginAction } from "@/app/(auth)/actions";
import { Card, Field, LinkButton, PrimaryButton, inputClassName } from "@/components/ui";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--care-canvas)] px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
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
              Ingresar a Cuida
            </h1>
            <p className="text-sm text-[color:var(--care-muted)]">
              Accedé con tu cuenta o una invitación aceptada.
            </p>
          </div>
        </div>

        {error ? (
          <p className="mb-5 rounded-2xl bg-[#fff4de] p-4 text-sm font-semibold text-[color:var(--care-warning)]">
            {error}
          </p>
        ) : null}

        <form action={loginAction} className="grid gap-4">
          <Field label="Email">
            <input
              className={inputClassName}
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Contraseña">
            <input
              className={inputClassName}
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <PrimaryButton type="submit" className="mt-2 w-full">
            Ingresar
          </PrimaryButton>
        </form>

        <div className="mt-6 grid gap-3 text-center">
          <a
            href="/registro"
            className="text-sm font-semibold text-[color:var(--care-ink)] underline decoration-[color:var(--care-teal)] underline-offset-4"
          >
            Crear una cuenta nueva
          </a>
          <LinkButton href="/" className="bg-white text-[color:var(--care-ink)]">
            Volver al inicio
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
