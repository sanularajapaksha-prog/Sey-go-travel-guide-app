-- ============================================================
-- Migration: Extend reviews table for full moderation workflow
-- Run once against your Supabase / PostgreSQL database.
-- All statements are idempotent (safe to re-run).
-- ============================================================

-- 1. New audit columns
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS title            text,
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS approved_at      timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by      text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 2. Ensure status column has the right default and is never NULL
ALTER TABLE public.reviews
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE public.reviews
  SET status = 'pending'
  WHERE status IS NULL;

ALTER TABLE public.reviews
  ALTER COLUMN status SET NOT NULL;

-- 3. Backfill updated_at for existing rows
UPDATE public.reviews
  SET updated_at = created_at
  WHERE updated_at IS NULL;

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_reviews_status     ON public.reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id   ON public.reviews (place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id    ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- 5. Optional: RLS helper — public/mobile can only read approved reviews
--    Uncomment if you use Row Level Security on the reviews table.
-- CREATE POLICY "public_read_approved" ON public.reviews
--   FOR SELECT TO anon, authenticated
--   USING (status = 'approved');
