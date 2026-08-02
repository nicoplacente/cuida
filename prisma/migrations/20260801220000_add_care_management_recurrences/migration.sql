CREATE TYPE "NotificationKind" AS ENUM ('REMINDER', 'MISSED');
CREATE TYPE "MedicationScheduleType" AS ENUM ('DAILY_TIMES', 'INTERVAL');

ALTER TYPE "ActivityType" ADD VALUE 'TASK_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'EVENT_COMPLETED';
ALTER TYPE "ActivityType" ADD VALUE 'EVENT_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'NOTE_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'NOTE_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'PATIENT_UPDATED';

ALTER TABLE "Patient"
ADD COLUMN "birthDate" TIMESTAMP(3);

ALTER TABLE "Medication"
ADD COLUMN "scheduleType" "MedicationScheduleType" NOT NULL DEFAULT 'DAILY_TIMES',
ADD COLUMN "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "intervalHours" INTEGER,
ADD COLUMN "dailyDoseCount" INTEGER NOT NULL DEFAULT 1;

UPDATE "Medication"
SET "reminderMinutes" = 15
WHERE "reminderMinutes" = 0;

ALTER TABLE "Medication"
DROP CONSTRAINT IF EXISTS "Medication_reminderMinutes_check";

ALTER TABLE "Medication"
ADD CONSTRAINT "Medication_reminderMinutes_check"
CHECK ("reminderMinutes" IN (15, 30, 60)),
ADD CONSTRAINT "Medication_dailyDoseCount_check"
CHECK ("dailyDoseCount" > 0),
ADD CONSTRAINT "Medication_intervalHours_check"
CHECK ("intervalHours" IS NULL OR "intervalHours" > 0),
ADD CONSTRAINT "Medication_date_range_check"
CHECK ("endDate" IS NULL OR "endDate" >= "startDate");

CREATE TABLE "MedicationSchedule" (
  "id" TEXT NOT NULL,
  "medicationId" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MedicationSchedule_pkey" PRIMARY KEY ("id")
);

INSERT INTO "MedicationSchedule" ("id", "medicationId", "time")
SELECT CONCAT('legacy-', "id"), "id", "schedule"
FROM "Medication";

CREATE UNIQUE INDEX "MedicationSchedule_medicationId_time_key"
ON "MedicationSchedule"("medicationId", "time");

CREATE INDEX "MedicationSchedule_medicationId_idx"
ON "MedicationSchedule"("medicationId");

ALTER TABLE "MedicationSchedule"
ADD CONSTRAINT "MedicationSchedule_medicationId_fkey"
FOREIGN KEY ("medicationId") REFERENCES "Medication"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarEvent"
ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "completedById" TEXT,
ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "CalendarEvent"
ADD CONSTRAINT "CalendarEvent_completedById_fkey"
FOREIGN KEY ("completedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD COLUMN "kind" "NotificationKind" NOT NULL DEFAULT 'REMINDER',
ADD COLUMN "occurrenceFor" TIMESTAMP(3);
