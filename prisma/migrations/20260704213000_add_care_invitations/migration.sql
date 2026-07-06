ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'MEMBER_INVITED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'INVITATION_ACCEPTED';

CREATE TABLE "CareInvitation" (
    "id" TEXT NOT NULL,
    "careCircleId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "CareRole" NOT NULL DEFAULT 'CAREGIVER',
    "token" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CareInvitation_token_key" ON "CareInvitation"("token");
CREATE INDEX "CareInvitation_careCircleId_email_idx" ON "CareInvitation"("careCircleId", "email");
CREATE INDEX "CareInvitation_token_idx" ON "CareInvitation"("token");

ALTER TABLE "CareInvitation" ADD CONSTRAINT "CareInvitation_careCircleId_fkey" FOREIGN KEY ("careCircleId") REFERENCES "CareCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareInvitation" ADD CONSTRAINT "CareInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
