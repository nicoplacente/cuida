-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_FOLDER_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_FOLDER_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'DOCUMENT_FOLDER_DELETED';

-- CreateTable
CREATE TABLE "DocumentFolder" (
    "id" TEXT NOT NULL,
    "careCircleId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "locationKey" TEXT NOT NULL,
    "systemKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "folderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentFolder_careCircleId_locationKey_key" ON "DocumentFolder"("careCircleId", "locationKey");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentFolder_careCircleId_systemKey_key" ON "DocumentFolder"("careCircleId", "systemKey");

-- CreateIndex
CREATE INDEX "DocumentFolder_careCircleId_parentId_idx" ON "DocumentFolder"("careCircleId", "parentId");

-- CreateIndex
CREATE INDEX "Document_careCircleId_folderId_idx" ON "Document"("careCircleId", "folderId");

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_careCircleId_fkey" FOREIGN KEY ("careCircleId") REFERENCES "CareCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DocumentFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DocumentFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the immutable root folders for every existing care circle.
INSERT INTO "DocumentFolder" ("id", "careCircleId", "name", "locationKey", "systemKey", "updatedAt")
SELECT CONCAT('folder_history_', "id"), "id", 'Historia clínica', 'root:historia clinica', 'MEDICAL_HISTORY', CURRENT_TIMESTAMP
FROM "CareCircle";

INSERT INTO "DocumentFolder" ("id", "careCircleId", "name", "locationKey", "systemKey", "updatedAt")
SELECT CONCAT('folder_anamnesis_', "id"), "id", 'Anamnesis', 'root:anamnesis', 'ANAMNESIS', CURRENT_TIMESTAMP
FROM "CareCircle";
