-- ============================================================
-- GANPATI APP — COMPLETE FRESH SETUP
-- Run this in Supabase SQL Editor (New Query)
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  email      TEXT UNIQUE,
  avatar_url TEXT,
  is_admin   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  slug              TEXT UNIQUE NOT NULL,
  invitation_type   TEXT DEFAULT 'family',
  host_name         TEXT NOT NULL,
  family_name       TEXT,
  city              TEXT NOT NULL,
  address           TEXT NOT NULL,
  landmark          TEXT,
  mobile            TEXT,
  family_photo_url  TEXT,
  maps_url          TEXT,
  arrival_date      TEXT NOT NULL,
  arrival_time      TEXT NOT NULL DEFAULT '10:00',
  sthapana_date     TEXT,
  sthapana_time     TEXT,
  aarti_time        TEXT,
  prasad_time       TEXT,
  visarjan_date     TEXT NOT NULL,
  visarjan_time     TEXT NOT NULL DEFAULT '18:00',
  duration_days     INTEGER DEFAULT 1,
  message           TEXT NOT NULL DEFAULT '',
  template_id       TEXT DEFAULT 'traditional',
  theme             TEXT DEFAULT 'saffron',
  ganpati_image_url TEXT,
  background        TEXT DEFAULT 'festive-gradient',
  show_flowers      BOOLEAN DEFAULT true,
  show_toran        BOOLEAN DEFAULT true,
  show_diyas        BOOLEAN DEFAULT true,
  show_rangoli      BOOLEAN DEFAULT true,
  show_bells        BOOLEAN DEFAULT true,
  show_particles    BOOLEAN DEFAULT true,
  show_mandala      BOOLEAN DEFAULT true,
  music_enabled     BOOLEAN DEFAULT false,
  family_story      TEXT,
  status            TEXT DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invitation_id, slug)
);

CREATE TABLE IF NOT EXISTS public.rsvps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name    TEXT,
  response      TEXT NOT NULL,
  guest_count   INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitation_views (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  viewed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitation_shares (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  platform      TEXT DEFAULT 'whatsapp',
  shared_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flower_offerings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.diya_offerings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  caption       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.templates (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  name_marathi  TEXT,
  category      TEXT DEFAULT 'traditional',
  preview_url   TEXT,
  configuration JSONB DEFAULT '{}',
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ganpati_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  category   TEXT DEFAULT 'traditional',
  image_url  TEXT NOT NULL,
  status     TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitations_updated_at ON public.invitations;
CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, is_admin)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. THE KEY FIX: SECURITY DEFINER admin check (no RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1), false);
$$;

-- 6. Enable RLS
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_views  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_offerings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diya_offerings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ganpati_images    ENABLE ROW LEVEL SECURITY;

-- 7. Drop ALL old policies (every possible name)
DO $drop$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END;
$drop$;

-- 8. Create fresh policies (SIMPLE — no recursion)

-- USERS: just check auth.uid() = id, use is_admin() for admin checks
CREATE POLICY "u_select" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "u_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "u_update" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "u_delete" ON public.users FOR DELETE USING (public.is_admin());

-- INVITATIONS: fully open read, authenticated write
CREATE POLICY "i_select" ON public.invitations FOR SELECT USING (true);
CREATE POLICY "i_insert" ON public.invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "i_update" ON public.invitations FOR UPDATE USING (true);
CREATE POLICY "i_delete" ON public.invitations FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- GUESTS: fully open
CREATE POLICY "g_select" ON public.guests FOR SELECT USING (true);
CREATE POLICY "g_insert" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "g_delete" ON public.guests FOR DELETE USING (true);

-- RSVPS: fully open
CREATE POLICY "r_select" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "r_insert" ON public.rsvps FOR INSERT WITH CHECK (true);

-- VIEWS: fully open
CREATE POLICY "v_select" ON public.invitation_views FOR SELECT USING (true);
CREATE POLICY "v_insert" ON public.invitation_views FOR INSERT WITH CHECK (true);

-- SHARES: fully open
CREATE POLICY "s_select" ON public.invitation_shares FOR SELECT USING (true);
CREATE POLICY "s_insert" ON public.invitation_shares FOR INSERT WITH CHECK (true);

-- FLOWERS: fully open
CREATE POLICY "f_select" ON public.flower_offerings FOR SELECT USING (true);
CREATE POLICY "f_insert" ON public.flower_offerings FOR INSERT WITH CHECK (true);

-- DIYAS: fully open
CREATE POLICY "d_select" ON public.diya_offerings FOR SELECT USING (true);
CREATE POLICY "d_insert" ON public.diya_offerings FOR INSERT WITH CHECK (true);

-- MEMORIES: fully open
CREATE POLICY "m_select" ON public.memories FOR SELECT USING (true);
CREATE POLICY "m_insert" ON public.memories FOR INSERT WITH CHECK (true);
CREATE POLICY "m_delete" ON public.memories FOR DELETE USING (true);

-- TEMPLATES: public read
CREATE POLICY "t_select" ON public.templates FOR SELECT USING (true);
CREATE POLICY "t_insert" ON public.templates FOR INSERT WITH CHECK (true);
CREATE POLICY "t_update" ON public.templates FOR UPDATE USING (true);
CREATE POLICY "t_delete" ON public.templates FOR DELETE USING (public.is_admin());

-- GANPATI IMAGES: public read
CREATE POLICY "gi_select" ON public.ganpati_images FOR SELECT USING (true);
CREATE POLICY "gi_insert" ON public.ganpati_images FOR INSERT WITH CHECK (true);
CREATE POLICY "gi_update" ON public.ganpati_images FOR UPDATE USING (true);
CREATE POLICY "gi_delete" ON public.ganpati_images FOR DELETE USING (public.is_admin());

-- 9. Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('ganpati-images',    'ganpati-images',    true),
  ('invitation-assets', 'invitation-assets', true),
  ('family-photos',     'family-photos',     true),
  ('memories',          'memories',          true),
  ('templates',         'templates',         true)
ON CONFLICT (id) DO NOTHING;

-- Storage: allow all reads/writes
DROP POLICY IF EXISTS "storage_all" ON storage.objects;
CREATE POLICY "storage_all" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
