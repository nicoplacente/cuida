import { Field, inputClassName } from "@/components/ui";
import { DEFAULT_REMINDER_MINUTES, REMINDER_OPTIONS } from "@/utils/reminders";

export function ReminderField({
  defaultValue = DEFAULT_REMINDER_MINUTES,
  name = "reminderMinutes",
  allowNone = true,
}) {
  const options = allowNone
    ? REMINDER_OPTIONS
    : REMINDER_OPTIONS.filter((option) => option.value > 0);

  return (
    <Field label="Recordatorio">
      <select className={inputClassName} defaultValue={String(defaultValue)} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
