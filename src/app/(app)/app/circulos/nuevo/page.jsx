import { createCareCircleAction } from "@/features/care-circles/actions";
import { PageHeader } from "@/components/page-header";
import { Card, Field, SecondaryLink, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";

export default function NewCareCirclePage() {
  return (
    <div>
      <PageHeader eyebrow="Nuevo círculo" title="Crear otro equipo de cuidado.">
        Sumá una nueva persona cuidada y organizá un equipo independiente con la
        misma cuenta.
      </PageHeader>

      <Card className="max-w-2xl p-6">
        <ToastForm action={createCareCircleAction} className="grid gap-4">
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
            <SubmitButton pendingLabel="Creando…">Crear círculo</SubmitButton>
            <SecondaryLink href="/app">Cancelar</SecondaryLink>
          </div>
        </ToastForm>
      </Card>
    </div>
  );
}
