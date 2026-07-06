import { createEventAction } from "@/features/calendar/actions";
import { requireCareContext } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, PrimaryButton, inputClassName } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { formatShortDate } from "@/utils/dates";

export default async function CalendarPage() {
  const { careCircle } = await requireCareContext();

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const events = await prisma.calendarEvent.findMany({
    where: { careCircleId: careCircle.id },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return (
    <div>
      <PageHeader eyebrow="Calendario" title="Turnos, controles y visitas en un solo lugar.">
        Agenda consultas médicas, estudios, controles y visitas para que todo el
        equipo sepa qué viene.
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Próximos eventos</h2>
          <div className="grid gap-4">
            {events.length ? (
              events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Badge tone="teal">
                        {formatShortDate(event.date)} · {event.time}
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
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No hay eventos cargados." />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Nuevo evento</h2>
          <form action={createEventAction} className="grid gap-4">
            <Field label="Título">
              <input className={inputClassName} name="title" required />
            </Field>
            <Field label="Fecha">
              <input className={inputClassName} type="date" name="date" required />
            </Field>
            <Field label="Hora">
              <input className={inputClassName} type="time" name="time" required />
            </Field>
            <Field label="Ubicación">
              <input className={inputClassName} name="location" />
            </Field>
            <Field label="Notas">
              <textarea className={inputClassName} name="notes" rows={4} />
            </Field>
            <PrimaryButton type="submit">Crear evento</PrimaryButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
