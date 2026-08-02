import { createLogAction, deleteLogAction } from "@/features/timeline/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { PageHeader } from "@/components/page-header";
import { formatDateTimeInput, formatShortDate, formatTime } from "@/utils/dates";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { LogEditButton } from "@/features/timeline/log-edit-button";

const logTypes = [
  ["MEAL", "Comida"],
  ["MOOD", "Ánimo"],
  ["SLEEP", "Sueño"],
  ["SYMPTOM", "Síntoma"],
  ["BEHAVIOR", "Comportamiento"],
  ["INCIDENT", "Incidente"],
  ["NOTE", "Nota"],
];

export default async function TimelinePage() {
  const { careCircle, canManage } = await requireCareContext();

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const logs = await prisma.dailyLog.findMany({
    where: { careCircleId: careCircle.id },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { occurredAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow="Historial diario" title="Una línea de tiempo humana y clara.">
        Registrá comidas, ánimo, sueño, síntomas, comportamiento e incidentes
        para que la evolución no dependa de la memoria.
      </PageHeader>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1fr_360px]" : ""}`}>
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Línea de tiempo</h2>
          <div className="grid gap-4">
            {logs.length ? (
              logs.map((log) => (
                <article key={log.id} className="border-l-2 border-[color:var(--care-teal)] pl-5">
                  <div className="rounded-2xl bg-[#f8fbfd] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                      <Badge>{formatShortDate(log.occurredAt)} · {formatTime(log.occurredAt)}</Badge>
                      <Badge tone="teal">{logTypes.find(([value]) => value === log.type)?.[1]}</Badge>
                      <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                        {log.user.name}
                      </p>
                      </div>
                      {canManage ? (
                        <div className="flex flex-wrap gap-2">
                          <LogEditButton
                            log={{
                              id: log.id,
                              type: log.type,
                              content: log.content,
                              occurredAt: formatDateTimeInput(log.occurredAt),
                            }}
                            logTypes={logTypes}
                          />
                          <ConfirmDeleteButton
                            action={deleteLogAction}
                            description="Se eliminará este registro del historial. Esta acción no se puede deshacer."
                            fields={{ logId: log.id }}
                            title="Eliminar registro"
                          />
                        </div>
                      ) : null}
                    </div>
                    <p className="mt-3 text-lg">{log.content}</p>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No hay registros todavía." />
            )}
          </div>
        </Card>

        {canManage ? (
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Nuevo registro</h2>
          <ToastForm action={createLogAction} className="grid gap-4">
            <Field label="Tipo">
              <select className={inputClassName} name="type" defaultValue="NOTE">
                {logTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Detalle">
              <textarea
                className={inputClassName}
                name="content"
                rows={6}
                placeholder="Ejemplo: Comió poco al mediodía y estuvo cansada."
                required
              />
            </Field>
            <Field label="Fecha y hora">
              <input
                className={inputClassName}
                defaultValue={formatDateTimeInput()}
                name="occurredAt"
                required
                type="datetime-local"
              />
            </Field>
            <SubmitButton pendingLabel="Agregando…">Agregar al historial</SubmitButton>
          </ToastForm>
        </Card>
        ) : null}
      </div>
    </div>
  );
}
