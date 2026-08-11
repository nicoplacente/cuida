import { createLogAction, deleteLogAction } from "@/features/timeline/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { PageHeader } from "@/components/page-header";
import { formatDateTimeInput, formatShortDate, formatTime } from "@/utils/dates";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import {
  CareRecordAction,
  CareRecordCard,
  CareRecordMetaItem,
} from "@/components/care-record-card";
import { LogEditButton } from "@/features/timeline/log-edit-button";
import { getLogTypeLabel, LOG_TYPES } from "@/features/timeline/log-types";

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
                <CareRecordCard
                  key={log.id}
                  header={(
                    <>
                      <CareRecordMetaItem position="leading">
                        <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                          {formatShortDate(log.occurredAt)} · {formatTime(log.occurredAt)}
                        </p>
                      </CareRecordMetaItem>
                      <CareRecordMetaItem position="trailing">
                        <Badge tone="teal">{getLogTypeLabel(log.type)}</Badge>
                      </CareRecordMetaItem>
                      <CareRecordMetaItem position="below">
                        <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                          {log.user.name}
                        </p>
                      </CareRecordMetaItem>
                    </>
                  )}
                  actions={canManage ? (
                    <>
                      <CareRecordAction>
                        <LogEditButton
                          log={{
                            id: log.id,
                            type: log.type,
                            content: log.content,
                            occurredAt: formatDateTimeInput(log.occurredAt),
                          }}
                          logTypes={LOG_TYPES}
                        />
                      </CareRecordAction>
                      <CareRecordAction>
                        <ConfirmDeleteButton
                          action={deleteLogAction}
                          description="Se eliminará este registro del historial. Esta acción no se puede deshacer."
                          fields={{ logId: log.id }}
                          title="Eliminar registro"
                        />
                      </CareRecordAction>
                    </>
                  ) : null}
                >
                  <p className="whitespace-pre-wrap text-lg">{log.content}</p>
                </CareRecordCard>
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
                {LOG_TYPES.map(([value, label]) => (
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
