-- ============================================================
-- EMERGENCY FIX: Run this in Supabase SQL Editor
-- Fixes "infinite recursion detected in policy for relation users"
-- ============================================================

-- STEP 1: Drop ALL existing policies (explicit names to avoid DO block issues)
DROP POLICY IF EXISTS "users_self_read"          ON public.users;
DROP POLICY IF EXISTS "users_self_update"         ON public.users;
DROP POLICY IF EXISTS "users_insert"              ON public.users;
DROP POLICY IF EXISTS "users_admin_all"           ON public.users;
DROP POLICY IF EXISTS "users_self_select"         ON public.users;
DROP POLICY IF EXISTS "users_self_insert"         ON public.users;
DROP POLICY IF EXISTS "users_admin_select"        ON public.users;
DROP POLICY IF EXISTS "users_admin_update"        ON public.users;
DROP POLICY IF EXISTS "users_admin_delete"        ON public.users;

DROP POLICY IF EXISTS "invitations_public_read"   ON public.invitations;
DROP POLICY IF EXISTS "invitations_owner_insert"  ON public.invitations;
DROP POLICY IF EXISTS "invitations_owner_update"  ON public.invitations;
DROP POLICY IF EXISTS "invitations_owner_delete"  ON public.invitations;
DROP POLICY IF EXISTS "invitations_admin_all"     ON public.invitations;
DROP POLICY IF EXISTS "invitations_public_select" ON public.invitations;
DROP POLICY IF EXISTS "invitations_insert"        ON public.invitations;

DROP POLICY IF EXISTS "guests_public_read"        ON public.guests;
DROP POLICY IF EXISTS "guests_owner_write"        ON public.guests;
DROP POLICY IF EXISTS "guests_owner_delete"       ON public.guests;
DROP POLICY IF EXISTS "guests_public_select"      ON public.guests;
DROP POLICY IF EXISTS "guests_insert"             ON public.guests;

DROP POLICY IF EXISTS "rsvps_public_read"         ON public.rsvps;
DROP POLICY IF EXISTS "rsvps_public_insert"       ON public.rsvps;
DROP POLICY IF EXISTS "rsvps_public_select"       ON public.rsvps;

DROP POLICY IF EXISTS "views_public_insert"       ON public.invitation_views;
DROP POLICY IF EXISTS "views_owner_read"          ON public.invitation_views;
DROP POLICY IF EXISTS "views_insert"              ON public.invitation_views;
DROP POLICY IF EXISTS "views_owner_select"        ON public.invitation_views;

DROP POLICY IF EXISTS "shares_public_insert"      ON public.invitation_shares;
DROP POLICY IF EXISTS "shares_owner_read"         ON public.invitation_shares;
DROP POLICY IF EXISTS "shares_insert"             ON public.invitation_shares;
DROP POLICY IF EXISTS "shares_owner_select"       ON public.invitation_shares;

DROP POLICY IF EXISTS "flowers_public_insert"     ON public.flower_offerings;
DROP POLICY IF EXISTS "flowers_public_read"       ON public.flower_offerings;
DROP POLICY IF EXISTS "flowers_insert"            ON public.flower_offerings;
DROP POLICY IF EXISTS "flowers_select"            ON public.flower_offerings;

DROP POLICY IF EXISTS "diyas_public_insert"       ON public.diya_offerings;
DROP POLICY IF EXISTS "diyas_public_read"         ON public.diya_offerings;
DROP POLICY IF EXISTS "diyas_insert"              ON public.diya_offerings;
DROP POLICY IF EXISTS "diyas_select"              ON public.diya_offerings;

DROP POLICY IF EXISTS "memories_public_read"      ON public.memories;
DROP POLICY IF EXISTS "memories_owner_insert"     ON public.memories;
DROP POLICY IF EXISTS "memories_owner_delete"     ON public.memories;
DROP POLICY IF EXISTS "memories_public_select"    ON public.memories;

DROP POLICY IF EXISTS "templates_public_read"     ON public.templates;
DROP POLICY IF EXISTS "templates_admin_write"     ON public.templates;
DROP POLICY IF EXISTS "templates_public_select"   ON public.templates;
DROP POLICY IF EXISTS "templates_admin_insert"    ON public.templates;
DROP POLICY IF EXISTS "templates_admin_update"    ON public.templates;
DROP POLICY IF EXISTS "templates_admin_delete"    ON public.templates;

DROP POLICY IF EXISTS "ganpati_images_public_read" ON public.ganpati_images;
DROP POLICY IF EXISTS "ganpati_images_admin_all"   ON public.ganpati_images;
DROP POLICY IF EXISTS "ganpati_images_select"      ON public.ganpati_images;
DROP POLICY IF EXISTS "ganpati_images_insert"      ON public.ganpati_images;
DROP POLICY IF EXISTS "ganpati_images_update"      ON public.ganpati_images;
DROP POLICY IF EXISTS "ganpati_images_delete"      ON public.ganpati_images;

-- ============================================================
-- STEP 2: Create SECURITY DEFINER function — THE KEY FIX
-- Reads users table WITHOUT triggering RLS (no recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- ============================================================
-- STEP 3: Create new, clean, non-recursive RLS policies
-- ============================================================

-- USERS: only use auth.uid() directly — never query users table here
CREATE POLICY "users_own_select"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_own_insert"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_own_update"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "users_admin_delete"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- INVITATIONS: public read (no auth needed to view), owner write
CREATE POLICY "inv_public_select"
  ON public.invitations FOR SELECT
  USING (true);

CREATE POLICY "inv_insert"
  ON public.invitations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "inv_owner_update"
  ON public.invitations FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "inv_owner_delete"
  ON public.invitations FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- GUESTS
CREATE POLICY "guests_select"  ON public.guests FOR SELECT USING (true);
CREATE POLICY "guests_insert"  ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "guests_delete"  ON public.guests FOR DELETE USING (true);

-- RSVPS
CREATE POLICY "rsvps_select"   ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "rsvps_insert"   ON public.rsvps FOR INSERT WITH CHECK (true);

-- INVITATION VIEWS
CREATE POLICY "views_insert"   ON public.invitation_views FOR INSERT WITH CHECK (true);
CREATE POLICY "views_select"   ON public.invitation_views FOR SELECT USING (true);

-- INVITATION SHARES
CREATE POLICY "shares_insert"  ON public.invitation_shares FOR INSERT WITH CHECK (true);
CREATE POLICY "shares_select"  ON public.invitation_shares FOR SELECT USING (true);

-- FLOWER OFFERINGS
CREATE POLICY "flowers_insert" ON public.flower_offerings FOR INSERT WITH CHECK (true);
CREATE POLICY "flowers_select" ON public.flower_offerings FOR SELECT USING (true);

-- DIYA OFFERINGS
CREATE POLICY "diyas_insert"   ON public.diya_offerings FOR INSERT WITH CHECK (true);
CREATE POLICY "diyas_select"   ON public.diya_offerings FOR SELECT USING (true);

-- MEMORIES
CREATE POLICY "memories_select" ON public.memories FOR SELECT USING (true);
CREATE POLICY "memories_insert" ON public.memories FOR INSERT WITH CHECK (true);
CREATE POLICY "memories_delete" ON public.memories FOR DELETE USING (true);

-- TEMPLATES
CREATE POLICY "templates_select" ON public.templates FOR SELECT USING (true);
CREATE POLICY "templates_insert" ON public.templates FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "templates_update" ON public.templates FOR UPDATE USING (public.is_admin());
CREATE POLICY "templates_delete" ON public.templates FOR DELETE USING (public.is_admin());

-- GANPATI IMAGES
CREATE POLICY "gimg_select"  ON public.ganpati_images FOR SELECT USING (true);
CREATE POLICY "gimg_insert"  ON public.ganpati_images FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "gimg_update"  ON public.ganpati_images FOR UPDATE USING (public.is_admin());
CREATE POLICY "gimg_delete"  ON public.ganpati_images FOR DELETE USING (public.is_admin());
