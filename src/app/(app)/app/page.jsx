import Image from "next/image";
import { AppSetupAlert } from "@/components/app-setup-alert";
import { DailyPlanRefresh } from "@/components/daily-plan-refresh";
import { PageHeader } from "@/components/page-header";
import { Badge, Card, EmptyState } from "@/components/ui";
import { PatientEditButton } from "@/features/care-circles/patient-edit-button";
import { getLogTypeLabel } from "@/features/timeline/log-types";
import { requireCareContext } from "@/services/care-circle";
import { getDashboardData } from "@/services/dashboard";
import { formatFullDate, formatTime } from "@/utils/dates";
import { getPatientAge } from "@/utils/patients";

export default async function DashboardPage() {
  const { user, careCircle, patient, canManage } = await requireCareContext();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  if (!careCircle || !patient) {
    return (
      <>
        <AppSetupAlert publicKey={publicKey} />
        <Card className="p-8">
          <EmptyState title="Todavía no hay un círculo activo.">
            Creá un círculo de cuidado para empezar a organizar la información.
          </EmptyState>
        </Card>
      </>
    );
  }

  const data = await getDashboardData(careCircle.id);
  const patientAge = getPatientAge(patient);

  return (
    <div>
      <AppSetupAlert publicKey={publicKey} />
      <DailyPlanRefresh refreshAt={data.nextDayStartsAt.toISOString()} />
      <PageHeader eyebrow="Dashboard" title={`Hola!, ${user.name}.`}>
        Hoy {patient.name} tiene {data.pendingMedications}{" "}
        {data.pendingMedications === 1
          ? "medicamento pendiente"
          : "medicamentos pendientes"}
        , {data.events.length}{" "}
        {data.events.length === 1 ? "turno médico" : "turnos médicos"} y{" "}
        {data.pendingTasks}{" "}
        {data.pendingTasks === 1
          ? "tarea por completar"
          : "tareas por completar"}
        .
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="grid gap-5 lg:grid-cols-[120px_1fr]">
              <div className="relative hidden aspect-square overflow-hidden rounded-3xl lg:block">
                <Image
                  src="/cuida-full.png"
                  alt="Logo de Cuida"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain p-3"
                  sizes="120px"
                />
              </div>
              <div>
                <Badge tone="teal">Paciente asociado</Badge>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                  <span className="lg:hidden">{patient.name}</span>
                  <span className="hidden lg:inline">
                    {patient.name}, {patientAge} años
                  </span>
                </h2>
                <p className="mt-2 font-semibold text-(--care-ink-soft)">
                  {patient.medicalCondition || "Sin condición médica cargada"}
                </p>
                {patient.importantNotes ? (
                  <p className="mt-4 hidden rounded-2xl bg-[#f8fbfd] p-4 text-sm text-(--care-ink-soft) lg:block">
                    {patient.importantNotes}
                  </p>
                ) : null}
                {canManage ? (
                  <div className="mt-4">
                    <PatientEditButton
                      careCircleName={careCircle.name}
                      patient={{
                        name: patient.name,
                        birthDate:
                          patient.birthDate?.toISOString().slice(0, 10) || "",
                        medicalCondition: patient.medicalCondition,
                        importantNotes: patient.importantNotes,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <section className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm font-semibold text-(--care-muted)">
                Medicación pendiente
              </p>
              <p className="mt-3 text-4xl font-semibold">
                {data.pendingMedications}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-(--care-muted)">
                Eventos de hoy
              </p>
              <p className="mt-3 text-4xl font-semibold">
                {data.events.length}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-(--care-muted)">
                Tareas pendientes
              </p>
              <p className="mt-3 text-4xl font-semibold">{data.pendingTasks}</p>
            </Card>
          </section>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Plan del día</h2>
              <Badge>{formatFullDate(data.todayStart)}</Badge>
            </div>
            <div className="grid gap-3">
              {data.dailyPlan.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-(--care-cloud) bg-[#f8fbfd] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-(--care-muted)">
                        {item.timeLabel} · {item.typeLabel}
                      </p>
                      <p className="mt-1 text-lg font-semibold">{item.title}</p>
                      {item.detail ? (
                        <p className="mt-1 text-sm text-(--care-ink-soft)">
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                    <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
                  </div>
                </div>
              ))}
              {!data.dailyPlan.length ? (
                <EmptyState title="No hay actividades planificadas para hoy." />
              ) : null}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Últimas notas</h2>
            <div className="grid gap-4">
              {data.logs.length ? (
                data.logs.map((log) => (
                  <div key={log.id} className="rounded-2xl bg-[#f8fbfd] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                        {formatTime(log.occurredAt)} · {log.user.name}
                      </p>
                      <Badge tone="teal">{getLogTypeLabel(log.type)}</Badge>
                    </div>
                    <p className="mt-2">{log.content}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="Sin notas todavía." />
              )}
            </div>
          </Card>
        </div>

        <aside className="min-h-0">
          <Card className="flex h-full min-h-0 flex-col p-6">
            <h2 className="mb-4 text-xl font-semibold">Actividad reciente</h2>
            <div
              aria-label="Listado de actividad reciente"
              className="grid max-h-[450px] gap-4 overflow-y-auto pr-2 xl:max-h-none xl:min-h-0 xl:flex-1"
              tabIndex={0}
            >
              {data.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-l-2 border-[color:var(--care-teal)] pl-4"
                >
                  <p className="font-semibold">{activity.message}</p>
                  <p className="text-sm text-[color:var(--care-muted)]">
                    {formatTime(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
