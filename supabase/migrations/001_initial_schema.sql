-- ============================================================
-- GANPATI INVITATION PLATFORM — FIXED DATABASE SCHEMA
-- Fixes: infinite recursion in RLS policies
-- Run this FULLY in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT,
  email        TEXT UNIQUE,
  avatar_url   TEXT,
  is_admin     BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
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
  arrival_date      DATE NOT NULL,
  arrival_time      TEXT NOT NULL DEFAULT '10:00',
  sthapana_date     DATE,
  sthapana_time     TEXT,
  aarti_time        TEXT,
  prasad_time       TEXT,
  visarjan_date     DATE NOT NULL,
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
  status            TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'visarjan', 'archived')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invitation_id, slug)
);

CREATE TABLE IF NOT EXISTS public.rsvps (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id       UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name     TEXT,
  response       TEXT NOT NULL CHECK (response IN ('yes', 'maybe', 'no')),
  guest_count    INTEGER DEFAULT 1,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitation_views (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id       UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  viewed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitation_shares (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  platform       TEXT DEFAULT 'whatsapp',
  shared_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flower_offerings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id       UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.diya_offerings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id       UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id  UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  image_url      TEXT NOT NULL,
  caption        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.templates (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  name_marathi   TEXT,
  category       TEXT DEFAULT 'traditional',
  preview_url    TEXT,
  configuration  JSONB DEFAULT '{}',
  status         TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ganpati_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  category   TEXT DEFAULT 'traditional',
  image_url  TEXT NOT NULL,
  status     TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: auto-update updated_at on invitations
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invitations_updated_at ON public.invitations;
CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: auto-create user profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(EXCLUDED.name, public.users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECURITY DEFINER FUNCTION — avoids RLS recursion
-- This is the KEY FIX: check admin status without triggering RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS
-- ============================================================

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

-- ============================================================
-- DROP OLD POLICIES (clean slate)
-- ============================================================

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- USERS TABLE POLICIES
-- KEY: use auth.uid() directly — do NOT query users table here
-- ============================================================

-- Any logged-in user can read their own row
CREATE POLICY "users_self_select"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Any logged-in user can insert their own row (signup)
CREATE POLICY "users_self_insert"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Any logged-in user can update their own row
CREATE POLICY "users_self_update"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admin can see ALL users — uses SECURITY DEFINER fn to avoid recursion
CREATE POLICY "users_admin_select"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "users_admin_update"
  ON public.users FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "users_admin_delete"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- INVITATIONS POLICIES
-- ============================================================

-- Anyone (incl. anonymous) can read active invitations (for sharing)
CREATE POLICY "invitations_public_select"
  ON public.invitations FOR SELECT
  USING (true);

-- Authenticated or anon can insert (guest invite creation)
CREATE POLICY "invitations_insert"
  ON public.invitations FOR INSERT
  WITH CHECK (true);

-- Owner can update their own
CREATE POLICY "invitations_owner_update"
  ON public.invitations FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Owner can delete their own
CREATE POLICY "invitations_owner_delete"
  ON public.invitations FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can do anything
CREATE POLICY "invitations_admin_all"
  ON public.invitations FOR ALL
  USING (public.is_admin());

-- ============================================================
-- GUESTS POLICIES
-- ============================================================

CREATE POLICY "guests_public_select"
  ON public.guests FOR SELECT USING (true);

CREATE POLICY "guests_insert"
  ON public.guests FOR INSERT WITH CHECK (true);

CREATE POLICY "guests_owner_delete"
  ON public.guests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE id = invitation_id AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

-- ============================================================
-- RSVPS POLICIES — anyone can submit/read
-- ============================================================

CREATE POLICY "rsvps_public_select"
  ON public.rsvps FOR SELECT USING (true);

CREATE POLICY "rsvps_public_insert"
  ON public.rsvps FOR INSERT WITH CHECK (true);

-- ============================================================
-- VIEWS POLICIES — anyone can insert a view
-- ============================================================

CREATE POLICY "views_insert"
  ON public.invitation_views FOR INSERT WITH CHECK (true);

CREATE POLICY "views_owner_select"
  ON public.invitation_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE id = invitation_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- SHARES POLICIES
-- ============================================================

CREATE POLICY "shares_insert"
  ON public.invitation_shares FOR INSERT WITH CHECK (true);

CREATE POLICY "shares_owner_select"
  ON public.invitation_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE id = invitation_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- FLOWER / DIYA OFFERINGS — public
-- ============================================================

CREATE POLICY "flowers_insert"
  ON public.flower_offerings FOR INSERT WITH CHECK (true);

CREATE POLICY "flowers_select"
  ON public.flower_offerings FOR SELECT USING (true);

CREATE POLICY "diyas_insert"
  ON public.diya_offerings FOR INSERT WITH CHECK (true);

CREATE POLICY "diyas_select"
  ON public.diya_offerings FOR SELECT USING (true);

-- ============================================================
-- MEMORIES POLICIES
-- ============================================================

CREATE POLICY "memories_public_select"
  ON public.memories FOR SELECT USING (true);

CREATE POLICY "memories_owner_insert"
  ON public.memories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE id = invitation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "memories_owner_delete"
  ON public.memories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE id = invitation_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- TEMPLATES — public read, admin write
-- ============================================================

CREATE POLICY "templates_public_select"
  ON public.templates FOR SELECT USING (true);

CREATE POLICY "templates_admin_insert"
  ON public.templates FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "templates_admin_update"
  ON public.templates FOR UPDATE USING (public.is_admin());

CREATE POLICY "templates_admin_delete"
  ON public.templates FOR DELETE USING (public.is_admin());

-- ============================================================
-- GANPATI IMAGES — active images public read, admin write
-- ============================================================

CREATE POLICY "ganpati_images_select"
  ON public.ganpati_images FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "ganpati_images_insert"
  ON public.ganpati_images FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "ganpati_images_update"
  ON public.ganpati_images FOR UPDATE USING (public.is_admin());

CREATE POLICY "ganpati_images_delete"
  ON public.ganpati_images FOR DELETE USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('ganpati-images',    'ganpati-images',    true),
  ('invitation-assets', 'invitation-assets', true),
  ('family-photos',     'family-photos',     false),
  ('memories',          'memories',          false),
  ('templates',         'templates',         true)
ON CONFLICT (id) DO NOTHING;

-- Drop old storage policies first
DROP POLICY IF EXISTS "ganpati_images_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "ganpati_images_auth_insert"  ON storage.objects;
DROP POLICY IF EXISTS "invitation_assets_read"      ON storage.objects;
DROP POLICY IF EXISTS "invitation_assets_insert"    ON storage.objects;
DROP POLICY IF EXISTS "memories_auth_insert"        ON storage.objects;
DROP POLICY IF EXISTS "memories_auth_select"        ON storage.objects;
DROP POLICY IF EXISTS "templates_read"              ON storage.objects;
DROP POLICY IF EXISTS "templates_admin_insert"      ON storage.objects;
DROP POLICY IF EXISTS "family_photos_auth"          ON storage.objects;

-- Ganpati images: public read, auth insert
CREATE POLICY "ganpati_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ganpati-images');

CREATE POLICY "ganpati_images_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ganpati-images' AND auth.role() = 'authenticated');

-- Invitation assets: public read/insert (used for uploaded Bappa images)
CREATE POLICY "invitation_assets_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invitation-assets');

CREATE POLICY "invitation_assets_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invitation-assets');

-- Memories: auth only
CREATE POLICY "memories_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memories' AND auth.role() = 'authenticated');

CREATE POLICY "memories_auth_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memories' AND auth.role() = 'authenticated');

-- Templates: public read
CREATE POLICY "templates_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'templates');

CREATE POLICY "templates_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'templates' AND auth.role() = 'authenticated');

-- Family photos: auth only
CREATE POLICY "family_photos_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'family-photos' AND auth.role() = 'authenticated');

CREATE POLICY "family_photos_auth_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'family-photos' AND auth.role() = 'authenticated');
