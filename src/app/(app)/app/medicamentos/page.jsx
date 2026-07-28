import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import {
  administerMedicationAction,
  createMedicationAction,
  deleteMedicationAction,
  toggleMedicationAction,
} from "@/features/medications/actions";
import { Badge, Card, EmptyState, Field, inputClassName } from "@/components/ui";
import {
  SecondarySubmitButton,
  SubmitButton,
  ToastForm,
} from "@/components/toast-form";
import { PageHeader } from "@/components/page-header";
import { ReminderField } from "@/components/reminder-field";
import { MedicationEditButton } from "@/features/medications/medication-edit-button";
import { getEndOfToday, getStartOfToday, formatTime } from "@/utils/dates";
import { formatReminderLabel } from "@/utils/reminders";

export default async function MedicationsPage() {
  const { careCircle } = await requireCareContext();

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const medications = await prisma.medication.findMany({
    where: { careCircleId: careCircle.id },
    include: {
      administrations: {
        where: {
          scheduledFor: {
            gte: getStartOfToday(),
            lte: getEndOfToday(),
          },
        },
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: [{ active: "desc" }, { schedule: "asc" }],
  });

  return (
    <div>
      <PageHeader eyebrow="Medicación" title="Control claro para evitar errores.">
        Registrá cada administración una sola vez por horario. Si alguien ya la
        marcó, el resto del equipo lo ve inmediatamente al actualizar.
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Medicamentos cargados</h2>
          <div className="grid gap-4">
            {medications.length ? (
              medications.map((medication) => {
                const administration = medication.administrations[0];
                return (
                  <article
                    key={medication.id}
                    className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                            {medication.schedule}
                          </p>
                          <Badge tone={medication.active ? "teal" : "neutral"}>
                            {medication.active ? "Activo" : "Inactivo"}
                          </Badge>
                          <Badge tone={medication.reminderMinutes ? "teal" : "neutral"}>
                            {formatReminderLabel(medication.reminderMinutes)}
                          </Badge>
                        </div>
                        <h3 className="mt-2 text-xl font-semibold">
                          {medication.name} {medication.dose}
                        </h3>
                        <p className="mt-1 text-sm text-[color:var(--care-ink-soft)]">
                          {medication.frequency}
                        </p>
                        {medication.instructions ? (
                          <p className="mt-3 text-sm text-[color:var(--care-muted)]">
                            {medication.instructions}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-2">
                        <MedicationEditButton
                          medication={{
                            id: medication.id,
                            name: medication.name,
                            dose: medication.dose,
                            schedule: medication.schedule,
                            reminderMinutes: medication.reminderMinutes,
                            frequency: medication.frequency,
                            instructions: medication.instructions,
                          }}
                        />
                        {administration ? (
                          <Badge tone="success">
                            Administrado por {administration.user.name} a las{" "}
                            {formatTime(administration.administeredAt)}
                          </Badge>
                        ) : medication.active ? (
                          <ToastForm action={administerMedicationAction}>
                            <input type="hidden" name="medicationId" value={medication.id} />
                            <SubmitButton pendingLabel="Registrando…">Administrar</SubmitButton>
                          </ToastForm>
                        ) : null}
                        <ToastForm action={toggleMedicationAction}>
                          <input type="hidden" name="medicationId" value={medication.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={String(!medication.active)}
                          />
                          <SecondarySubmitButton pendingLabel="Actualizando…">
                            {medication.active ? "Desactivar" : "Activar"}
                          </SecondarySubmitButton>
                        </ToastForm>
                        <ToastForm action={deleteMedicationAction}>
                          <input type="hidden" name="medicationId" value={medication.id} />
                          <SecondarySubmitButton pendingLabel="Eliminando…" tone="danger">
                            Eliminar
                          </SecondarySubmitButton>
                        </ToastForm>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState title="No hay medicamentos cargados." />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Agregar medicamento</h2>
          <ToastForm action={createMedicationAction} className="grid gap-4">
            <Field label="Nombre">
              <input className={inputClassName} name="name" required />
            </Field>
            <Field label="Dosis">
              <input className={inputClassName} name="dose" placeholder="10 mg" required />
            </Field>
            <Field label="Horario">
              <input className={inputClassName} type="time" name="schedule" required />
            </Field>
            <ReminderField />
            <Field label="Frecuencia">
              <input
                className={inputClassName}
                name="frequency"
                placeholder="Todos los días"
                required
              />
            </Field>
            <Field label="Instrucciones">
              <textarea className={inputClassName} name="instructions" rows={4} />
            </Field>
            <SubmitButton pendingLabel="Guardando…">Guardar medicamento</SubmitButton>
          </ToastForm>
        </Card>
      </div>
    </div>
  );
}
