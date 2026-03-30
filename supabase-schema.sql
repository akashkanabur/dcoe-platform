-- ============================================================
-- D-CoE Platform — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users table (students) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'trainer')),
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tests table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  module          TEXT,
  course_name     TEXT,
  exam_code       TEXT UNIQUE,
  is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  description     TEXT DEFAULT '',
  duration        INTEGER NOT NULL DEFAULT 30,
  total_marks     INTEGER NOT NULL DEFAULT 0,
  passing_marks   INTEGER NOT NULL DEFAULT 50,
  allowed_attempts INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by      TEXT NOT NULL DEFAULT 'trainer-001',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ
);

-- ── Questions table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id         UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('mcq', 'multi-select', 'true-false', 'short-answer', 'long-answer')),
  text            TEXT NOT NULL,
  options         JSONB DEFAULT '[]',
  correct_answer  JSONB NOT NULL,
  marks           INTEGER NOT NULL DEFAULT 1,
  "order"         INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Attempts table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attempts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id         UUID NOT NULL REFERENCES public.tests(id),
  student_id      UUID NOT NULL REFERENCES public.users(id),
  student_name    TEXT NOT NULL,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  submitted_at    TIMESTAMPTZ,
  answers         JSONB DEFAULT '[]',
  score           INTEGER DEFAULT 0,
  total_marks     INTEGER DEFAULT 0,
  percentage      INTEGER DEFAULT 0,
  passed          BOOLEAN DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'submitted', 'timed-out'))
);

-- ── Exam enrollments (code-based access) ───────────────────
CREATE TABLE IF NOT EXISTS public.exam_enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id     UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  via_code    TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (test_id, student_id)
);

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (used by API routes)
CREATE POLICY "Service role full access - users"     ON public.users     FOR ALL USING (true);
CREATE POLICY "Service role full access - tests"     ON public.tests     FOR ALL USING (true);
CREATE POLICY "Service role full access - questions" ON public.questions FOR ALL USING (true);
CREATE POLICY "Service role full access - attempts"  ON public.attempts  FOR ALL USING (true);
CREATE POLICY "Service role full access - enrollments" ON public.exam_enrollments FOR ALL USING (true);

-- ── Indexes for performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_test_id   ON public.questions(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test_id    ON public.attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_id ON public.attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status     ON public.attempts(status);
CREATE INDEX IF NOT EXISTS idx_tests_status        ON public.tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_exam_code     ON public.tests(exam_code);
CREATE INDEX IF NOT EXISTS idx_enroll_test_student ON public.exam_enrollments(test_id, student_id);

-- ── Admin audit log (optional) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  action     TEXT NOT NULL,
  details    JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
