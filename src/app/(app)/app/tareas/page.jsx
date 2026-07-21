import { createTaskAction, completeTaskAction } from "@/features/tasks/actions";
import { requireCareContext, getCareCircleMembers } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, PrimaryButton, inputClassName } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { formatShortDate } from "@/utils/dates";

export default async function TasksPage() {
  const { careCircle } = await requireCareContext();

  if (!careCircle) {
    return <EmptyState title="No hay círculo activo." />;
  }

  const [tasks, members] = await Promise.all([
    prisma.careTask.findMany({
      where: { careCircleId: careCircle.id },
      include: {
        assignedTo: { select: { name: true } },
        completedBy: { select: { name: true } },
      },
      orderBy: [{ completed: "asc" }, { scheduledTime: "asc" }],
    }),
    getCareCircleMembers(careCircle.id),
  ]);

  return (
    <div>
      <PageHeader eyebrow="Tareas" title="Responsabilidades compartidas sin confusión.">
        Crea tareas simples, asigna responsables cuando haga falta y registra
        quién completó cada cuidado.
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Tareas del círculo</h2>
          <div className="grid gap-4">
            {tasks.length ? (
              tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-2xl border border-[color:var(--care-cloud)] bg-[#f8fbfd] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                        {task.scheduledDate ? formatShortDate(task.scheduledDate) : "Sin fecha"}
                        {task.scheduledTime ? ` · ${task.scheduledTime}` : " · Sin horario"}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">{task.title}</h3>
                      {task.description ? (
                        <p className="mt-2 text-sm text-[color:var(--care-ink-soft)]">
                          {task.description}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm text-[color:var(--care-muted)]">
                        Responsable: {task.assignedTo?.name || "Sin asignar"}
                      </p>
                    </div>
                    <div className="grid justify-items-end gap-2">
                      {task.completed ? (
                        <Badge tone="success">
                          Completada por {task.completedBy?.name || "el equipo"}
                        </Badge>
                      ) : (
                        <form action={completeTaskAction}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <PrimaryButton type="submit">Completar</PrimaryButton>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No hay tareas cargadas." />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Nueva tarea</h2>
          <form action={createTaskAction} className="grid gap-4">
            <Field label="Título">
              <input className={inputClassName} name="title" required />
            </Field>
            <Field label="Descripción">
              <textarea className={inputClassName} name="description" rows={4} />
            </Field>
            <Field label="Fecha">
              <input className={inputClassName} type="date" name="scheduledDate" />
            </Field>
            <Field label="Horario">
              <input className={inputClassName} type="time" name="scheduledTime" />
            </Field>
            <Field label="Responsable opcional">
              <select className={inputClassName} name="assignedToId" defaultValue="">
                <option value="">Sin asignar</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </Field>
            <PrimaryButton type="submit">Crear tarea</PrimaryButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
