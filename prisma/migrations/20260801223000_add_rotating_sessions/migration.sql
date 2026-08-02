ALTER TABLE "Session"
ADD COLUMN "refreshVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "previousRefreshVersion" INTEGER,
ADD COLUMN "previousRefreshExpiresAt" TIMESTAMP(3);

CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
