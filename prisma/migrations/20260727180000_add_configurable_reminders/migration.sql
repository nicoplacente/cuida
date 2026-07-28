ALTER TYPE "ActivityType" ADD VALUE 'MEDICATION_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'TASK_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'EVENT_UPDATED';

ALTER TABLE "Medication"
ADD COLUMN "reminderMinutes" INTEGER NOT NULL DEFAULT 15;

ALTER TABLE "CareTask"
ADD COLUMN "reminderMinutes" INTEGER NOT NULL DEFAULT 15;

ALTER TABLE "CalendarEvent"
ADD COLUMN "reminderMinutes" INTEGER NOT NULL DEFAULT 15;

ALTER TABLE "Medication"
ADD CONSTRAINT "Medication_reminderMinutes_check"
CHECK ("reminderMinutes" IN (0, 15, 30, 60));

ALTER TABLE "CareTask"
ADD CONSTRAINT "CareTask_reminderMinutes_check"
CHECK ("reminderMinutes" IN (0, 15, 30, 60));

ALTER TABLE "CalendarEvent"
ADD CONSTRAINT "CalendarEvent_reminderMinutes_check"
CHECK ("reminderMinutes" IN (0, 15, 30, 60));
