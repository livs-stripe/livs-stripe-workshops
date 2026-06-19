-- Scalability refactor: account pool, attack job queue, charge outcomes, scores
-- Run after 0001_event_session_times.sql

-- Pre-provisioned Stripe account pool
CREATE TABLE IF NOT EXISTS account_pool (
  id TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "stripeAccountId" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_account_pool_event_status ON account_pool("eventId", status);

-- Attack simulation job queue
CREATE TABLE IF NOT EXISTS attack_jobs (
  id TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  "queuedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "chargesTotal" INTEGER NOT NULL DEFAULT 15,
  "chargesFired" INTEGER NOT NULL DEFAULT 0,
  "chargesBlocked" INTEGER NOT NULL DEFAULT 0,
  "chargesSucceeded" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT
);
CREATE INDEX IF NOT EXISTS idx_attack_jobs_status ON attack_jobs(status, "queuedAt");
CREATE UNIQUE INDEX IF NOT EXISTS idx_attack_jobs_participant_module ON attack_jobs("participantId", "moduleId");

-- Individual charge outcomes from attack simulations
CREATE TABLE IF NOT EXISTS charge_outcomes (
  id TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "chargeId" TEXT,
  amount INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  "isFraudAttempt" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_charge_outcomes_participant ON charge_outcomes("participantId", "eventId");

-- Aggregated scores
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  "participantId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "virtualBalance" INTEGER NOT NULL DEFAULT 100000,
  "fraudBlocked" INTEGER NOT NULL DEFAULT 0,
  "fraudLosses" INTEGER NOT NULL DEFAULT 0,
  "falsePositives" INTEGER NOT NULL DEFAULT 0,
  "modulesComplete" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scores_participant_id ON scores("participantId");
CREATE INDEX IF NOT EXISTS idx_scores_event_id ON scores("eventId");

-- Indexes on existing tables for 50-participant scale
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants("eventId");
CREATE INDEX IF NOT EXISTS idx_participants_event_email ON participants("eventId", email);
CREATE INDEX IF NOT EXISTS idx_module_progress_participant ON module_progress("participantId");
CREATE INDEX IF NOT EXISTS idx_connected_accounts_event ON connected_accounts("eventId");

-- Add provisioning columns to participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "provisioningStatus" TEXT NOT NULL DEFAULT 'ready';
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "provisionedAt" TIMESTAMP;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT;
