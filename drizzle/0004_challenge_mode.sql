-- Challenge mode: balance tracking on participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "startingBalance" integer NOT NULL DEFAULT 1000000;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "currentBalance" integer NOT NULL DEFAULT 1000000;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "totalBlockedAmount" integer NOT NULL DEFAULT 0;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "totalLostAmount" integer NOT NULL DEFAULT 0;

-- Step completions table
CREATE TABLE IF NOT EXISTS step_completions (
  id text PRIMARY KEY,
  "participantId" text NOT NULL,
  "eventId" text NOT NULL,
  "moduleNumber" integer NOT NULL,
  "stepNumber" integer NOT NULL,
  "completedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_step_completions_participant_module 
  ON step_completions("participantId", "moduleNumber");

-- Module attack queue table
CREATE TABLE IF NOT EXISTS module_attack_queue (
  id text PRIMARY KEY,
  "participantId" text NOT NULL,
  "eventId" text NOT NULL,
  "moduleNumber" integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  "startedAt" timestamptz,
  "completedAt" timestamptz,
  "chargesFired" integer NOT NULL DEFAULT 0,
  "chargesBlocked" integer NOT NULL DEFAULT 0,
  "chargesSucceeded" integer NOT NULL DEFAULT 0,
  "amountLostCents" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attack_queue_status 
  ON module_attack_queue(status, "createdAt");
CREATE INDEX IF NOT EXISTS idx_attack_queue_participant 
  ON module_attack_queue("participantId", "moduleNumber");
