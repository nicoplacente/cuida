import {
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
} from "@/features/tasks/actions";
import { requireCareContext, getCareCircleMembers } from "@/services/care-circle";
import { prisma } from "@/services/db";
import { Badge, Card, EmptyState, Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { PageHeader } from "@/components/page-header";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import {
  CareRecordAction,
  CareRecordCard,
  CareRecordMetaItem,
  careRecordPrimaryActionClassName,
} from "@/components/care-record-card";
import { ReminderField } from "@/components/reminder-field";
import { TaskEditButton } from "@/features/tasks/task-edit-button";
import { formatShortDate, getScheduledDateForDay } from "@/utils/dates";
import { formatReminderLabel } from "@/utils/reminders";

export default async function TasksPage() {
  const { careCircle, canManage } = await requireCareContext();

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
        Creá tareas simples, asigná responsables cuando haga falta y registrá
        quién completó cada cuidado.
      </PageHeader>

      <div className={`grid gap-6 ${canManage ? "xl:grid-cols-[1fr_360px]" : ""}`}>
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Tareas del círculo</h2>
          <div className="grid gap-4">
            {tasks.length ? (
              tasks.map((task) => {
                const isOverdue = !task.completed && task.scheduledDate && task.scheduledTime
                  ? getScheduledDateForDay(task.scheduledDate, task.scheduledTime) < new Date()
                  : false;
                return (
                <CareRecordCard
                  key={task.id}
                  header={(
                    <>
                      <CareRecordMetaItem position="leading">
                        <p className="text-sm font-semibold text-[color:var(--care-muted)]">
                          {task.scheduledDate ? formatShortDate(task.scheduledDate) : "Sin fecha"}
                          {task.scheduledTime ? ` · ${task.scheduledTime}` : " · Sin horario"}
                        </p>
                      </CareRecordMetaItem>
                      <CareRecordMetaItem position="below">
                        <Badge tone={task.reminderMinutes ? "teal" : "neutral"}>
                          {formatReminderLabel(task.reminderMinutes)}
                        </Badge>
                      </CareRecordMetaItem>
                      <CareRecordMetaItem position="trailing">
                        <Badge tone={task.completed ? "success" : isOverdue ? "warning" : "neutral"}>
                          {task.completed ? "Realizada" : isOverdue ? "Vencida" : "Pendiente"}
                        </Badge>
                      </CareRecordMetaItem>
                    </>
                  )}
                  actions={canManage ? (
                    <>
                      <CareRecordAction>
                        <TaskEditButton
                          members={members.map((member) => ({
                            id: member.user.id,
                            name: member.user.name,
                          }))}
                          task={{
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            scheduledDate: task.scheduledDate
                              ? task.scheduledDate.toISOString().slice(0, 10)
                              : null,
                            scheduledTime: task.scheduledTime,
                            reminderMinutes: task.reminderMinutes,
                            assignedToId: task.assignedToId,
                          }}
                        />
                      </CareRecordAction>
                      <CareRecordAction primary>
                        {task.completed ? (
                          <Badge tone="success">
                            Completada por {task.completedBy?.name || "el equipo"}
                          </Badge>
                        ) : (
                          <ToastForm action={completeTaskAction}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <SubmitButton
                              className={careRecordPrimaryActionClassName}
                              pendingLabel="Completando…"
                            >
                              Completar
                            </SubmitButton>
                          </ToastForm>
                        )}
                      </CareRecordAction>
                      <CareRecordAction>
                        <ConfirmDeleteButton
                          action={deleteTaskAction}
                          description={`Se eliminará la tarea ${task.title} y sus avisos asociados.`}
                          fields={{ taskId: task.id }}
                          title={`Eliminar ${task.title}`}
                        />
                      </CareRecordAction>
                    </>
                  ) : null}
                >
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  {task.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--care-ink-soft)]">
                      {task.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-[color:var(--care-muted)]">
                    Responsable: {task.assignedTo?.name || "Sin asignar"}
                  </p>
                </CareRecordCard>
                );
              })
            ) : (
              <EmptyState title="No hay tareas cargadas." />
            )}
          </div>
        </Card>

        {canManage ? (
        <Card className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Nueva tarea</h2>
          <ToastForm action={createTaskAction} className="grid gap-4">
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
            <ReminderField />
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
            <SubmitButton pendingLabel="Creando…">Crear tarea</SubmitButton>
          </ToastForm>
        </Card>
        ) : null}
      </div>
    </div>
  );
}
