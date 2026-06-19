-- Ephemeral session timing + data lifecycle markers for events.
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "sessionEndsAt" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "endedAt" timestamp;
-- Backfill session end for existing rows (best-effort).
UPDATE "events"
SET "sessionEndsAt" = "createdAt" + ("durationMinutes" * interval '1 minute')
WHERE "sessionEndsAt" IS NULL;
UPDATE "events" SET "endedAt" = "createdAt" WHERE "status" = 'ended' AND "endedAt" IS NULL;
