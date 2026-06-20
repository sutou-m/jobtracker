-- Migration: Create job_postings table with trigger and RLS
-- Ticket: T-01
-- Date: 2026-06-20
-- Author: supabase-db-architect agent

-- ============================================================
-- 1. Extensions (if needed)
-- ============================================================
-- gen_random_uuid() is available by default in Supabase (pgcrypto enabled)

-- ============================================================
-- 2. Table Creation
-- ============================================================

CREATE TABLE IF NOT EXISTS job_postings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT        NOT NULL,
  source      TEXT        NOT NULL DEFAULT 'other',
    -- Allowed values: 'indeed' | 'lancers' | 'findy' | 'wantedly' | 'other'
  title       TEXT,                          -- Japanese text: UTF-8 encoding required
  summary     TEXT,                          -- Japanese text: UTF-8 encoding required
  rate        TEXT,                          -- Japanese text: UTF-8 encoding required
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'not_applied',
    -- Allowed values: 'not_applied' | 'applied' | 'interview' | 'won' | 'declined'
  user_id     UUID,                          -- NULL allowed: reserved for future Supabase Auth integration
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Indexes
-- ============================================================

-- Index for status filtering (used in WHERE clauses on list page)
CREATE INDEX IF NOT EXISTS idx_job_postings_status
  ON job_postings (status);

-- Index for source filtering (used in WHERE clauses on list page)
CREATE INDEX IF NOT EXISTS idx_job_postings_source
  ON job_postings (source);

-- Index for sort order (updated_at DESC is the default sort)
CREATE INDEX IF NOT EXISTS idx_job_postings_updated_at
  ON job_postings (updated_at DESC);

-- Index for sort order (created_at DESC for newest-first sort)
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at
  ON job_postings (created_at DESC);

-- Index for user_id (prepared for future Auth integration)
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id
  ON job_postings (user_id);

-- ============================================================
-- 4. Trigger: auto-update updated_at on row change
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger first to make this idempotent (CREATE OR REPLACE not supported for triggers)
DROP TRIGGER IF EXISTS job_postings_updated_at ON job_postings;

CREATE TRIGGER job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. Row Level Security
-- ============================================================

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- Allow all operations from anon role (personal-use app, no auth required)
-- When Supabase Auth is added in the future, replace this policy with user-scoped policies.
DROP POLICY IF EXISTS "allow_all_for_anon" ON job_postings;

CREATE POLICY "allow_all_for_anon" ON job_postings
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- TODO: Future Auth policy template (uncomment and replace the anon policy above when Auth is enabled)
-- CREATE POLICY "Users can manage own rows" ON job_postings
--   FOR ALL TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. Column Comments
-- ============================================================

COMMENT ON TABLE job_postings IS 'Job posting records managed by the user. Table prefix "job_" avoids collision with existing "kak_" and "vet_" tables.';

COMMENT ON COLUMN job_postings.id         IS 'Primary key (UUID v4)';
COMMENT ON COLUMN job_postings.url        IS 'URL of the job posting page (required)';
COMMENT ON COLUMN job_postings.source     IS 'Job site identifier: indeed | lancers | findy | wantedly | other';
COMMENT ON COLUMN job_postings.title      IS 'Job title (Japanese text: UTF-8)';
COMMENT ON COLUMN job_postings.summary    IS 'Summary or notes about the job (Japanese text: UTF-8)';
COMMENT ON COLUMN job_postings.rate       IS 'Expected compensation / rate (free-form text, Japanese text: UTF-8)';
COMMENT ON COLUMN job_postings.tags       IS 'Required skills and tags (text array, e.g. {React, TypeScript})';
COMMENT ON COLUMN job_postings.status     IS 'Progress status: not_applied | applied | interview | won | declined';
COMMENT ON COLUMN job_postings.user_id    IS 'Reserved for future Supabase Auth integration (NULL until Auth is enabled)';
COMMENT ON COLUMN job_postings.created_at IS 'Row creation timestamp (UTC, set automatically)';
COMMENT ON COLUMN job_postings.updated_at IS 'Row last-update timestamp (UTC, auto-updated by trigger)';
