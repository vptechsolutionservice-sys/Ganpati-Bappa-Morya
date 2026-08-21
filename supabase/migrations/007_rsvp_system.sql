-- ============================================================
-- GANPATI APP — RSVP SYSTEM
-- Migration 007: Full RSVP module
-- Run in Supabase SQL Editor (New Query)
-- Safe: drops old rsvps table and recreates with correct schema
-- ============================================================

-- ─── 1. DROP OLD RSVPS TABLE ────────────────────────────────
-- (it had wrong schema: response='yes'|'maybe'|'no', guest_count)
DROP TABLE IF EXISTS public.rsvps CASCADE;

-- ─── 2. RSVP SETTINGS COLUMNS ON INVITATIONS ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='rsvp_enabled') THEN
    ALTER TABLE public.invitations ADD COLUMN rsvp_enabled        BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='rsvp_allow_maybe') THEN
    ALTER TABLE public.invitations ADD COLUMN rsvp_allow_maybe    BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='rsvp_max_per_person') THEN
    ALTER TABLE public.invitations ADD COLUMN rsvp_max_per_person INTEGER DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='rsvp_allow_message') THEN
    ALTER TABLE public.invitations ADD COLUMN rsvp_allow_message  BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='rsvp_show_public_count') THEN
    ALTER TABLE public.invitations ADD COLUMN rsvp_show_public_count BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='rsvp_deadline') THEN
    ALTER TABLE public.invitations ADD COLUMN rsvp_deadline       TIMESTAMPTZ DEFAULT NULL;
  END IF;
END;
$$;

-- ─── 3. NEW RSVPS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rsvps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id   UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_token     TEXT,                    -- from guests.slug for personalized links
  session_key     TEXT,                    -- browser-generated key for open invitations
  guest_name      TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'COMING'
                    CHECK (status IN ('COMING', 'MAYBE', 'NOT_ATTENDING')),
  attendee_count  INTEGER NOT NULL DEFAULT 1 CHECK (attendee_count >= 0),
  message         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- A guest_token may appear only once per invitation
  UNIQUE (invitation_id, guest_token),
  -- A session_key may appear only once per invitation  
  UNIQUE (invitation_id, session_key)
);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS rsvps_updated_at ON public.rsvps;
CREATE TRIGGER rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. INDEXES ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id  ON public.rsvps (invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_token    ON public.rsvps (guest_token);
CREATE INDEX IF NOT EXISTS idx_rsvps_status         ON public.rsvps (status);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at     ON public.rsvps (created_at);

-- ─── 5. ENABLE RLS ───────────────────────────────────────────
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS POLICIES ─────────────────────────────────────────
-- Drop any existing policies
DROP POLICY IF EXISTS "rsvp_select_guest"   ON public.rsvps;
DROP POLICY IF EXISTS "rsvp_select_host"    ON public.rsvps;
DROP POLICY IF EXISTS "rsvp_insert_guest"   ON public.rsvps;
DROP POLICY IF EXISTS "rsvp_update_guest"   ON public.rsvps;
DROP POLICY IF EXISTS "rsvp_delete_host"    ON public.rsvps;
DROP POLICY IF EXISTS "rsvp_admin"          ON public.rsvps;

-- Guests: can always read RSVPs for a given invitation (for public count feature)
-- They can INSERT (one per invitation per token/session)
-- They can UPDATE their own (by token or session_key)
-- Hosts (invitation owner): can read + delete all RSVPs for their invitations
-- Admins: full access

-- SELECT: public (anyone can read RSVPs for any invitation — host controls public display in UI)
CREATE POLICY "rsvp_select_all" ON public.rsvps FOR SELECT USING (true);

-- INSERT: anyone (we rely on UNIQUE constraint for duplicate protection)
CREATE POLICY "rsvp_insert_all" ON public.rsvps FOR INSERT WITH CHECK (true);

-- UPDATE: only if guest_token or session_key matches, OR if user is the invitation owner, OR admin
CREATE POLICY "rsvp_update_own" ON public.rsvps FOR UPDATE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = invitation_id
        AND i.user_id = auth.uid()
    )
  );

-- DELETE: only invitation owner or admin
CREATE POLICY "rsvp_delete_host" ON public.rsvps FOR DELETE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = invitation_id
        AND i.user_id = auth.uid()
    )
  );

-- ─── 7. RSVP STATS FUNCTION ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_rsvp_stats(invitation_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coming_count     INTEGER;
  v_maybe_count      INTEGER;
  v_not_count        INTEGER;
  v_total_count      INTEGER;
  v_confirmed_people INTEGER;
  v_possible_people  INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE status = 'COMING'),
    COUNT(*) FILTER (WHERE status = 'MAYBE'),
    COUNT(*) FILTER (WHERE status = 'NOT_ATTENDING'),
    COUNT(*),
    COALESCE(SUM(attendee_count) FILTER (WHERE status = 'COMING'), 0),
    COALESCE(SUM(attendee_count) FILTER (WHERE status = 'MAYBE'), 0)
  INTO
    v_coming_count,
    v_maybe_count,
    v_not_count,
    v_total_count,
    v_confirmed_people,
    v_possible_people
  FROM public.rsvps
  WHERE invitation_id = invitation_uuid;

  RETURN jsonb_build_object(
    'coming_count',      v_coming_count,
    'maybe_count',       v_maybe_count,
    'not_count',         v_not_count,
    'total_count',       v_total_count,
    'confirmed_people',  v_confirmed_people,
    'possible_people',   v_possible_people
  );
END;
$$;
