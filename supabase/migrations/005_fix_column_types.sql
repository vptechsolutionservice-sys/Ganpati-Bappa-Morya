-- ============================================================
-- SCHEMA FIX: Convert DATE columns to TEXT + fix any issues
-- Run this if you get 400 errors on invitations insert
-- ============================================================

-- Convert DATE columns to TEXT (prevents empty string rejections)
ALTER TABLE public.invitations
  ALTER COLUMN arrival_date  TYPE TEXT USING arrival_date::text,
  ALTER COLUMN visarjan_date TYPE TEXT USING visarjan_date::text,
  ALTER COLUMN sthapana_date TYPE TEXT USING sthapana_date::text;

-- Remove NOT NULL from date columns (allow empty/null during draft saves)
ALTER TABLE public.invitations
  ALTER COLUMN arrival_date  DROP NOT NULL,
  ALTER COLUMN visarjan_date DROP NOT NULL;

-- Add defaults so empty inserts don't fail
ALTER TABLE public.invitations
  ALTER COLUMN arrival_date  SET DEFAULT '',
  ALTER COLUMN visarjan_date SET DEFAULT '',
  ALTER COLUMN host_name     DROP NOT NULL,
  ALTER COLUMN city          DROP NOT NULL,
  ALTER COLUMN address       DROP NOT NULL;

ALTER TABLE public.invitations
  ALTER COLUMN host_name SET DEFAULT 'Host',
  ALTER COLUMN city      SET DEFAULT 'City',
  ALTER COLUMN address   SET DEFAULT 'Address';

-- Verify result
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'invitations'
ORDER BY ordinal_position;
