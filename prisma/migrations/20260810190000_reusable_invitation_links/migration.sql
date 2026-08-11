ALTER TABLE "CareInvitation"
ALTER COLUMN "email" DROP NOT NULL;

CREATE INDEX "CareInvitation_careCircleId_expiresAt_idx"
ON "CareInvitation"("careCircleId", "expiresAt");
