import { Field, inputClassName } from "@/components/ui";
import { DEFAULT_REMINDER_MINUTES, REMINDER_OPTIONS } from "@/utils/reminders";

export function ReminderField({
  defaultValue = DEFAULT_REMINDER_MINUTES,
  name = "reminderMinutes",
}) {
  return (
    <Field label="Recordatorio">
      <select className={inputClassName} defaultValue={String(defaultValue)} name={name}>
        {REMINDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
