"use client";

import { useState } from "react";
import { ReminderField } from "@/components/reminder-field";
import { Field, inputClassName } from "@/components/ui";

export function MedicationFormFields({ medication, startDate }) {
  const [scheduleType, setScheduleType] = useState(
    medication?.scheduleType || "DAILY_TIMES",
  );
  const [dailyDoseCount, setDailyDoseCount] = useState(
    medication?.dailyDoseCount || medication?.times?.length || 1,
  );
  const [hasNoEndDate, setHasNoEndDate] = useState(!medication?.endDate);
  const defaultTimes = medication?.times?.length
    ? medication.times
    : [medication?.schedule || ""];

  return (
    <>
      <Field label="Nombre">
        <input className={inputClassName} defaultValue={medication?.name || ""} name="name" required />
      </Field>
      <Field label="Dosis">
        <input
          className={inputClassName}
          defaultValue={medication?.dose || ""}
          name="dose"
          placeholder="Ejemplo: 10 mg"
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha de inicio">
          <input
            className={inputClassName}
            defaultValue={medication?.startDate || startDate}
            name="startDate"
            required
            type="date"
          />
        </Field>
        <Field label="Fecha de finalización">
          <input
            className={inputClassName}
            defaultValue={medication?.endDate || ""}
            disabled={hasNoEndDate}
            name="endDate"
            required={!hasNoEndDate}
            type="date"
          />
        </Field>
      </div>
      <input name="hasNoEndDate" type="hidden" value={String(hasNoEndDate)} />
      <label className="flex items-center gap-3 rounded-xl bg-[color:var(--care-canvas)] px-4 py-3 text-sm font-semibold">
        <input
          checked={hasNoEndDate}
          className="size-4 accent-[color:var(--care-teal)]"
          onChange={(event) => setHasNoEndDate(event.target.checked)}
          type="checkbox"
        />
        Tratamiento sin fecha límite
      </label>
      <Field label="Modalidad">
        <select
          className={inputClassName}
          name="scheduleType"
          onChange={(event) => setScheduleType(event.target.value)}
          value={scheduleType}
        >
          <option value="DAILY_TIMES">Horarios diarios exactos</option>
          <option value="INTERVAL">Cada X horas</option>
        </select>
      </Field>

      {scheduleType === "DAILY_TIMES" ? (
        <div
          key="daily-times-fields"
          className="grid gap-4 rounded-2xl border border-[color:var(--care-cloud)] bg-[color:var(--care-canvas)] p-4"
        >
          <Field label="Cantidad de tomas por día">
            <input
              className={inputClassName}
              min="1"
              name="dailyDoseCount"
              onChange={(event) => setDailyDoseCount(Math.max(1, Number(event.target.value) || 1))}
              required
              type="number"
              value={dailyDoseCount}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: dailyDoseCount }, (_, index) => (
              <Field key={index} label={`Horario ${index + 1}`}>
                <input
                  className={inputClassName}
                  defaultValue={defaultTimes[index] || ""}
                  name="scheduleTimes"
                  required
                  type="time"
                />
              </Field>
            ))}
          </div>
        </div>
      ) : (
        <div
          key="interval-fields"
          className="grid gap-4 rounded-2xl border border-[color:var(--care-cloud)] bg-[color:var(--care-canvas)] p-4 sm:grid-cols-2"
        >
          <Field label="Administrar cada cuántas horas">
            <input
              className={inputClassName}
              defaultValue={medication?.intervalHours || ""}
              min="1"
              name="intervalHours"
              placeholder="Ejemplo: 6"
              required
              type="number"
            />
          </Field>
          <Field label="Hora de la primera toma">
            <input
              className={inputClassName}
              defaultValue={medication?.schedule || ""}
              name="firstDoseTime"
              required
              type="time"
            />
          </Field>
        </div>
      )}

      <ReminderField allowNone={false} defaultValue={medication?.reminderMinutes || 15} />
      <p className="rounded-xl bg-[#fff4de] px-4 py-3 text-sm text-[color:var(--care-warning)]">
        Si una toma sigue pendiente una hora después, el círculo recibirá un aviso.
      </p>
      <Field label="Instrucciones">
        <textarea
          className={inputClassName}
          defaultValue={medication?.instructions || ""}
          name="instructions"
          rows={4}
        />
      </Field>
    </>
  );
}
