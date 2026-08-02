import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import {
  administerMedicationAction,
  createMedicationAction,
  deleteMedicationAction,
  toggleMedicationAction,
} from "@/features/medications/actions";
import { Badge, Card, EmptyState } from "@/components/ui";
import {
  SecondarySubmitButton,
  SubmitButton,
  ToastForm,
} from "@/components/toast-form";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { PageHeader } from "@/components/page-header";
import { MedicationEditButton } from "@/features/medications/medication-edit-button";
import { MedicationFormFields } from "@/features/medications/medication-form-fields";
import { formatFullDate, formatTime, getEndOfToday, getStartOfToday } from "@/utils/dates";
import {
  getMedicationFrequencyLabel,
  getMedicationOccurrences,
  HOUR_MS,
} from "@/utils/medication-schedules";
import { formatReminderLabel } from "@/utils/reminders";

export default async function MedicationsPage() {
  const { careCircle, canManage } = await requireCareContext();

  if (!careCircle) return <EmptyState title="No hay círculo activo." />;

  const todayStart = getStartOfToday();
  const todayEnd = getEndOfToday();
  const now = new Date();
  const medications = await prisma.medication.findMany({
    where: { careCircleId: careCircle.id },
    include: {
      times: { orderBy: { time: "asc" } },
      administrations: {
        where: { scheduledFor: { gte: todayStart, lte: todayEnd } },
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: [{ active: "desc" }, { startDate: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader eyebrow="Medicación" title="Cada toma, en el momento correcto.">
        Organizá horarios diarios o tratamientos por intervalos. Cada toma se
        registra por separado y el equipo recibe un aviso si continúa pendiente.
      </PageHeader>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1fr_380px]" : ""}`}>
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Tratamientos cargados</h2>
          <div className="grid gap-4">
            {medications.length ? (
              medications.map((medication) => {
                const occurrences = getMedicationOccurrences(
                  medication,
                  todayStart,
                  todayEnd,
                );
                const administrations = new Map(
                  medication.administrations.map((administration) => [
                    administration.scheduledFor.getTime(),
                    administration,
                  ]),
                );
                const editMedication = {
                  id: medication.id,
                  name: medication.name,
                  dose: medication.dose,
                  schedule: medication.schedule,
                  scheduleType: medication.scheduleType,
                  startDate: medication.startDate.toISOString().slice(0, 10),
                  endDate: medication.endDate?.toISOString().slice(0, 10) || null,
                  intervalHours: medication.intervalHours,
                  dailyDoseCount: medication.dailyDoseCount,
                  reminderMinutes: medication.reminderMinutes,
                  instructions: medication.instructions,
                  times: medication.times.map(({ time }) => time),
                };

                return (
                  <article
                    key={medication.id}
                    className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={medication.active ? "teal" : "neutral"}>
                            {medication.active ? "Activo" : "Inactivo"}
                          </Badge>
                          <Badge>{getMedicationFrequencyLabel(medication)}</Badge>
                          <Badge tone="teal">{formatReminderLabel(medication.reminderMinutes)}</Badge>
                        </div>
                        <h3 className="mt-3 text-xl font-semibold">
                          {medication.name} {medication.dose}
                        </h3>
                        <p className="mt-1 text-sm text-[color:var(--care-muted)]">
                          Desde el {formatFullDate(medication.startDate)} hasta {" "}
                          {medication.endDate
                            ? formatFullDate(medication.endDate)
                            : "que se indique su finalización"}
                        </p>
                        {medication.instructions ? (
                          <p className="mt-3 text-sm text-[color:var(--care-ink-soft)]">
                            {medication.instructions}
                          </p>
                        ) : null}
                      </div>

                      {canManage ? (
                        <div className="flex flex-wrap gap-2">
                          <MedicationEditButton medication={editMedication} />
                          <ToastForm action={toggleMedicationAction}>
                            <input name="medicationId" type="hidden" value={medication.id} />
                            <input name="active" type="hidden" value={String(!medication.active)} />
                            <SecondarySubmitButton pendingLabel="Actualizando…">
                              {medication.active ? "Desactivar" : "Activar"}
                            </SecondarySubmitButton>
                          </ToastForm>
                          <ConfirmDeleteButton
                            action={deleteMedicationAction}
                            description={`Se eliminarán ${medication.name}, sus tomas registradas y sus avisos asociados.`}
                            fields={{ medicationId: medication.id }}
                            title={`Eliminar ${medication.name}`}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-[color:var(--care-cloud)] pt-4">
                      <p className="text-sm font-semibold">Tomas de hoy</p>
                      {occurrences.length ? (
                        occurrences.map((occurrence) => {
                          const administration = administrations.get(
                            occurrence.scheduledFor.getTime(),
                          );
                          const isOverdue = now.getTime() > occurrence.scheduledFor.getTime() + HOUR_MS;
                          return (
                            <div
                              key={occurrence.scheduledFor.toISOString()}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3"
                            >
                              <div className="flex items-center gap-2">
                                <p className="font-semibold tabular-nums">{occurrence.time}</p>
                                {administration ? (
                                  <Badge tone="success">Administrado</Badge>
                                ) : isOverdue ? (
                                  <Badge tone="warning">Vencido</Badge>
                                ) : (
                                  <Badge>Pendiente</Badge>
                                )}
                              </div>
                              {administration ? (
                                <p className="text-sm text-[color:var(--care-muted)]">
                                  {administration.user.name} · {formatTime(administration.administeredAt)}
                                </p>
                              ) : medication.active && canManage ? (
                                <ToastForm action={administerMedicationAction}>
                                  <input name="medicationId" type="hidden" value={medication.id} />
                                  <input
                                    name="scheduledFor"
                                    type="hidden"
                                    value={occurrence.scheduledFor.toISOString()}
                                  />
                                  <SubmitButton pendingLabel="Registrando…">Administrar</SubmitButton>
                                </ToastForm>
                              ) : null}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-[color:var(--care-muted)]">
                          Este tratamiento no tiene tomas programadas para hoy.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState title="No hay medicamentos cargados." />
            )}
          </div>
        </Card>

        {canManage ? (
          <Card className="h-fit p-6">
            <h2 className="mb-5 text-xl font-semibold">Agregar medicamento</h2>
            <ToastForm action={createMedicationAction} className="grid gap-4" resetOnSuccess>
              <MedicationFormFields startDate={todayStart.toISOString().slice(0, 10)} />
              <SubmitButton pendingLabel="Guardando…">Guardar medicamento</SubmitButton>
            </ToastForm>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
