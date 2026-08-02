import {
  completeEventAction,
  createEventAction,
  deleteEventAction,
} from "@/features/calendar/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { PageHeader } from "@/components/page-header";
import { ReminderField } from "@/components/reminder-field";
import { EventEditButton } from "@/features/calendar/event-edit-button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { formatShortDate, getScheduledDateForDay } from "@/utils/dates";
import { formatReminderLabel } from "@/utils/reminders";

export default async function CalendarPage() {
  const { careCircle, canManage } = await requireCareContext();

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const events = await prisma.calendarEvent.findMany({
    where: { careCircleId: careCircle.id },
    include: { completedBy: { select: { name: true } } },
    orderBy: [{ completed: "asc" }, { date: "asc" }, { time: "asc" }],
  });

  return (
    <div>
      <PageHeader eyebrow="Calendario" title="Turnos, controles y visitas en un solo lugar.">
        Agendá consultas médicas, estudios, controles y visitas para que todo el
        equipo sepa qué viene.
      </PageHeader>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1fr_360px]" : ""}`}>
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Próximos eventos</h2>
          <div className="grid gap-4">
            {events.length ? (
              events.map((event) => {
                const isOverdue = !event.completed
                  && getScheduledDateForDay(event.date, event.time) < new Date();
                return (
                <article
                  key={event.id}
                  className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Badge tone="teal">
                        {formatShortDate(event.date)} · {event.time}
                      </Badge>
                      <Badge tone={event.reminderMinutes ? "teal" : "neutral"}>
                        {formatReminderLabel(event.reminderMinutes)}
                      </Badge>
                      <Badge tone={event.completed ? "success" : isOverdue ? "warning" : "neutral"}>
                        {event.completed ? "Realizado" : isOverdue ? "Vencido" : "Pendiente"}
                      </Badge>
                      <h3 className="mt-3 text-xl font-semibold">{event.title}</h3>
                      {event.location ? (
                        <p className="mt-2 text-sm font-semibold text-[color:var(--care-ink-soft)]">
                          {event.location}
                        </p>
                      ) : null}
                      {event.notes ? (
                        <p className="mt-2 text-sm text-[color:var(--care-muted)]">
                          {event.notes}
                        </p>
                      ) : null}
                    </div>
                    {canManage ? (
                    <div className="grid justify-items-end gap-2">
                    <EventEditButton
                      event={{
                        id: event.id,
                        title: event.title,
                        date: event.date.toISOString().slice(0, 10),
                        time: event.time,
                        reminderMinutes: event.reminderMinutes,
                        location: event.location,
                        notes: event.notes,
                      }}
                    />
                    {event.completed ? (
                      <p className="text-sm text-[color:var(--care-muted)]">
                        Realizado por {event.completedBy?.name || "el equipo"}
                      </p>
                    ) : (
                      <ToastForm action={completeEventAction}>
                        <input name="eventId" type="hidden" value={event.id} />
                        <SubmitButton pendingLabel="Registrando…">Marcar como realizado</SubmitButton>
                      </ToastForm>
                    )}
                    <ConfirmDeleteButton
                      action={deleteEventAction}
                      description={`Se eliminará el evento ${event.title} y sus avisos asociados.`}
                      fields={{ eventId: event.id }}
                      title={`Eliminar ${event.title}`}
                    />
                    </div>
                    ) : null}
                  </div>
                </article>
                );
              })
            ) : (
              <EmptyState title="No hay eventos cargados." />
            )}
          </div>
        </Card>

        {canManage ? (
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Nuevo evento</h2>
          <ToastForm action={createEventAction} className="grid gap-4">
            <Field label="Título">
              <input className={inputClassName} name="title" required />
            </Field>
            <Field label="Fecha">
              <input className={inputClassName} type="date" name="date" required />
            </Field>
            <Field label="Hora">
              <input className={inputClassName} type="time" name="time" required />
            </Field>
            <ReminderField />
            <Field label="Ubicación">
              <input className={inputClassName} name="location" />
            </Field>
            <Field label="Notas">
              <textarea className={inputClassName} name="notes" rows={4} />
            </Field>
            <SubmitButton pendingLabel="Creando…">Crear evento</SubmitButton>
          </ToastForm>
        </Card>
        ) : null}
      </div>
    </div>
  );
}
