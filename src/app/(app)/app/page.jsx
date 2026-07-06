import Image from "next/image";
import { requireCareContext } from "@/services/care-circle";
import { getDashboardData } from "@/services/dashboard";
import { Badge, Card, EmptyState } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { formatTime } from "@/utils/dates";

export default async function DashboardPage() {
  const { user, careCircle, patient } = await requireCareContext();

  if (!careCircle || !patient) {
    return (
      <Card className="p-8">
        <EmptyState title="Todavía no hay un círculo activo.">
          Crea un círculo de cuidado para empezar a organizar la información.
        </EmptyState>
      </Card>
    );
  }

  const data = await getDashboardData(careCircle.id);

  return (
    <div>
      <PageHeader eyebrow="Dashboard" title={`Buenos días, ${user.name}.`}>
        Hoy {patient.name} tiene {data.pendingMedications} medicamentos
        pendientes, {data.events.length} turno médico y {data.pendingTasks}
        tareas por completar.
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="grid gap-5 sm:grid-cols-[120px_1fr]">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-[color:var(--care-teal-soft)]">
                <Image
                  src={patient.photo || "/cuida-full.png"}
                  alt={`Foto de ${patient.name}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>
              <div>
                <Badge tone="teal">Paciente asociado</Badge>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                  {patient.name}, {patient.age} años
                </h2>
                <p className="mt-2 font-semibold text-[color:var(--care-ink-soft)]">
                  {patient.medicalCondition || "Sin condición médica cargada"}
                </p>
                {patient.importantNotes ? (
                  <p className="mt-4 rounded-2xl bg-[#f8fbfd] p-4 text-sm text-[color:var(--care-ink-soft)]">
                    {patient.importantNotes}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <section className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                Medicación pendiente
              </p>
              <p className="mt-3 text-4xl font-semibold">{data.pendingMedications}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                Turnos de hoy
              </p>
              <p className="mt-3 text-4xl font-semibold">{data.events.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                Tareas pendientes
              </p>
              <p className="mt-3 text-4xl font-semibold">{data.pendingTasks}</p>
            </Card>
          </section>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Plan del día</h2>
              <Badge>{new Date().toLocaleDateString("es-AR")}</Badge>
            </div>
            <div className="grid gap-3">
              {data.medications.map((medication) => {
                const administration = medication.administrations[0];
                return (
                  <div
                    key={medication.id}
                    className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                          {medication.schedule}
                        </p>
                        <p className="text-lg font-semibold">
                          {medication.name} {medication.dose}
                        </p>
                      </div>
                      {administration ? (
                        <Badge tone="success">
                          Administrado por {administration.user.name}
                        </Badge>
                      ) : (
                        <Badge tone="warning">Pendiente</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <aside className="grid gap-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Actividad reciente</h2>
            <div className="grid gap-4">
              {data.activities.map((activity) => (
                <div key={activity.id} className="border-l-2 border-[color:var(--care-teal)] pl-4">
                  <p className="font-semibold">{activity.message}</p>
                  <p className="text-sm text-[color:var(--care-muted)]">
                    {formatTime(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Últimas notas</h2>
            <div className="grid gap-4">
              {data.logs.length ? (
                data.logs.map((log) => (
                  <div key={log.id} className="rounded-2xl bg-[#f8fbfd] p-4">
                    <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                      {formatTime(log.occurredAt)} · {log.user.name}
                    </p>
                    <p className="mt-2">{log.content}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="Sin notas todavía." />
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
