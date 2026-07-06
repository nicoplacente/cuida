import { createCareCircleAction } from "@/features/care-circles/actions";
import { PageHeader } from "@/components/page-header";
import { Card, Field, PrimaryButton, SecondaryLink, inputClassName } from "@/components/ui";

export default async function NewCareCirclePage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div>
      <PageHeader eyebrow="Nuevo círculo" title="Crear otro equipo de cuidado.">
        Sumá una nueva persona cuidada y organizá un equipo independiente con la
        misma cuenta.
      </PageHeader>

      {error ? (
        <p className="mb-5 rounded-2xl bg-[#fff4de] p-4 text-sm font-semibold text-[color:var(--care-warning)]">
          {error}
        </p>
      ) : null}

      <Card className="max-w-2xl p-6">
        <form action={createCareCircleAction} className="grid gap-4">
          <Field label="Nombre del círculo">
            <input
              className={inputClassName}
              name="circleName"
              placeholder="Ejemplo: Cuidado de Marta"
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

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton type="submit">Crear círculo</PrimaryButton>
            <SecondaryLink href="/app">Cancelar</SecondaryLink>
          </div>
        </form>
      </Card>
    </div>
  );
}
