-- Ephemeral session timing + data lifecycle markers for events.
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "session_ends_at" timestamp;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "ended_at" timestamp;
-- Backfill session end for existing rows (best-effort).
UPDATE "events"
SET "session_ends_at" = "created_at" + ("duration_minutes" * interval '1 minute')
WHERE "session_ends_at" IS NULL;
UPDATE "events" SET "ended_at" = "created_at" WHERE "status" = 'ended' AND "ended_at" IS NULL;
