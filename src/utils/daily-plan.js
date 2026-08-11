const typeOrder = {
  MEDICATION: 0,
  TASK: 1,
  EVENT: 2,
};

function getStoredDateKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getTaskDetail(task) {
  return [
    task.description,
    task.assignedTo?.name ? `Responsable: ${task.assignedTo.name}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getEventDetail(event) {
  return [event.location, event.notes].filter(Boolean).join(" · ");
}

export function createDailyPlan({ dateKey, events, medicationPlan, tasks }) {
  const items = [];

  for (const { administration, medication, occurrence } of medicationPlan) {
    if (occurrence.dateKey !== dateKey) continue;

    items.push({
      detail: administration?.user?.name
        ? `Administrado por ${administration.user.name}`
        : medication.instructions || "",
      id: `medication:${medication.id}:${occurrence.scheduledFor.toISOString()}`,
      isAllDay: false,
      sortTime: occurrence.time,
      statusLabel: administration ? "Administrado" : "Pendiente",
      statusTone: administration ? "success" : "warning",
      timeLabel: occurrence.time,
      title: `${medication.name} ${medication.dose}`.trim(),
      type: "MEDICATION",
      typeLabel: "Medicamento",
    });
  }

  for (const task of tasks) {
    if (getStoredDateKey(task.scheduledDate) !== dateKey) continue;

    const isAllDay = !task.scheduledTime;
    items.push({
      detail: getTaskDetail(task),
      id: `task:${task.id}`,
      isAllDay,
      sortTime: task.scheduledTime || "",
      statusLabel: task.completed ? "Realizada" : "Pendiente",
      statusTone: task.completed ? "success" : "warning",
      timeLabel: task.scheduledTime || "Todo el día",
      title: task.title,
      type: "TASK",
      typeLabel: "Tarea",
    });
  }

  for (const event of events) {
    if (getStoredDateKey(event.date) !== dateKey) continue;

    items.push({
      detail: getEventDetail(event),
      id: `event:${event.id}`,
      isAllDay: false,
      sortTime: event.time,
      statusLabel: event.completed ? "Realizado" : "Pendiente",
      statusTone: event.completed ? "success" : "warning",
      timeLabel: event.time,
      title: event.title,
      type: "EVENT",
      typeLabel: "Evento",
    });
  }

  return items.toSorted((first, second) => {
    if (first.isAllDay !== second.isAllDay) return first.isAllDay ? -1 : 1;

    const timeComparison = first.sortTime.localeCompare(second.sortTime);
    if (timeComparison !== 0) return timeComparison;

    const typeComparison = typeOrder[first.type] - typeOrder[second.type];
    if (typeComparison !== 0) return typeComparison;
    return first.title.localeCompare(second.title, "es");
  });
}
