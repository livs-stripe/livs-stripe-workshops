-- Add error tracking columns to connected_accounts
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS "errorMessage" text;
ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS "errorCode" text;

-- Add error tracking and termination columns to account_pool
ALTER TABLE account_pool ADD COLUMN IF NOT EXISTS "errorMessage" text;
ALTER TABLE account_pool ADD COLUMN IF NOT EXISTS "errorCode" text;
ALTER TABLE account_pool ADD COLUMN IF NOT EXISTS "terminatedAt" timestamp;
