"use client";

import { EditModal } from "@/components/edit-modal";
import { ReminderField } from "@/components/reminder-field";
import { Field, inputClassName } from "@/components/ui";
import { SubmitButton, ToastForm } from "@/components/toast-form";
import { updateTaskAction } from "@/features/tasks/actions";

export function TaskEditButton({ members, task }) {
  return (
    <EditModal eyebrow="Tareas" title={`Editar ${task.title}`}>
      {(close) => (
        <ToastForm action={updateTaskAction} className="grid gap-4" onSuccess={close}>
          <input name="taskId" type="hidden" value={task.id} />
          <Field label="Título">
            <input
              className={inputClassName}
              defaultValue={task.title}
              name="title"
              required
            />
          </Field>
          <Field label="Descripción">
            <textarea
              className={inputClassName}
              defaultValue={task.description || ""}
              name="description"
              rows={4}
            />
          </Field>
          <Field label="Fecha">
            <input
              className={inputClassName}
              defaultValue={task.scheduledDate || ""}
              name="scheduledDate"
              type="date"
            />
          </Field>
          <Field label="Horario">
            <input
              className={inputClassName}
              defaultValue={task.scheduledTime || ""}
              name="scheduledTime"
              type="time"
            />
          </Field>
          <ReminderField defaultValue={task.reminderMinutes} />
          <Field label="Responsable opcional">
            <select
              className={inputClassName}
              defaultValue={task.assignedToId || ""}
              name="assignedToId"
            >
              <option value="">Sin asignar</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </Field>
          <SubmitButton pendingLabel="Guardando cambios…">Guardar cambios</SubmitButton>
        </ToastForm>
      )}
    </EditModal>
  );
}
