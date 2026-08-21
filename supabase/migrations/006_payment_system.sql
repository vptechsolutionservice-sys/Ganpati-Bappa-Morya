-- ============================================================
-- GANPATI APP — PAYMENT SYSTEM
-- Migration 006: payments, app_settings, admin_logs
-- Run this in Supabase SQL Editor (New Query)
-- Safe to run: uses IF NOT EXISTS everywhere
-- ============================================================

-- ─── 1. APP SETTINGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('invitation_price',     '50'),
  ('upi_id',               ''),
  ('upi_payee_name',       ''),
  ('payment_instructions', '1. QR code scan करा\n2. ₹50 pay करा\n3. Payment complete केल्यावर transaction ID copy करा\n4. खाली transaction ID enter करा\n5. Submit करा'),
  ('support_contact',      ''),
  ('payment_note',         'Payment manually verified होते. सहसा 1-2 तासांत आमंत्रण unlock होते.')
ON CONFLICT (key) DO NOTHING;

-- ─── 2. ALTER INVITATIONS ───────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='payment_status') THEN
    ALTER TABLE public.invitations ADD COLUMN payment_status TEXT DEFAULT 'FREE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='is_unlocked') THEN
    ALTER TABLE public.invitations ADD COLUMN is_unlocked BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='is_public') THEN
    ALTER TABLE public.invitations ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='payment_id') THEN
    ALTER TABLE public.invitations ADD COLUMN payment_id UUID;
  END IF;
END;
$$;

-- ─── 3. PAYMENTS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID REFERENCES public.users(id) ON DELETE SET NULL,
  invitation_id           UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  amount                  NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  currency                TEXT NOT NULL DEFAULT 'INR',
  transaction_id          TEXT NOT NULL,
  payment_screenshot_url  TEXT,
  status                  TEXT NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','PAID','REJECTED','REFUNDED')),
  rejection_reason        TEXT,
  verified_by             UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transaction_id)
);

-- Auto-update updated_at for payments
DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. ADMIN LOGS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. STORAGE BUCKET FOR SCREENSHOTS ──────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- ─── 6. ENABLE RLS ──────────────────────────────────────────
ALTER TABLE public.payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs   ENABLE ROW LEVEL SECURITY;

-- ─── 7. RLS POLICIES ────────────────────────────────────────

-- Drop existing payment policies if any
DROP POLICY IF EXISTS "p_select_own"  ON public.payments;
DROP POLICY IF EXISTS "p_select_admin" ON public.payments;
DROP POLICY IF EXISTS "p_insert_own"  ON public.payments;
DROP POLICY IF EXISTS "p_update_admin" ON public.payments;
DROP POLICY IF EXISTS "p_delete_admin" ON public.payments;

-- PAYMENTS: users see only their own; admins see all
-- Users can INSERT their own payments
-- ONLY ADMINS can UPDATE payment status
CREATE POLICY "p_select_own"    ON public.payments FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "p_insert_own"    ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "p_update_admin"  ON public.payments FOR UPDATE
  USING (public.is_admin());
CREATE POLICY "p_delete_admin"  ON public.payments FOR DELETE
  USING (public.is_admin());

-- APP SETTINGS: everyone can read; only admins can write
DROP POLICY IF EXISTS "as_select" ON public.app_settings;
DROP POLICY IF EXISTS "as_update" ON public.app_settings;
DROP POLICY IF EXISTS "as_insert" ON public.app_settings;
CREATE POLICY "as_select" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "as_update" ON public.app_settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "as_insert" ON public.app_settings FOR INSERT WITH CHECK (public.is_admin());

-- ADMIN LOGS: only admins
DROP POLICY IF EXISTS "al_select" ON public.admin_logs;
DROP POLICY IF EXISTS "al_insert" ON public.admin_logs;
CREATE POLICY "al_select" ON public.admin_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "al_insert" ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin());

-- PAYMENT SCREENSHOTS STORAGE: owner uploads, admin reads all
DROP POLICY IF EXISTS "ps_select" ON storage.objects;
DROP POLICY IF EXISTS "ps_insert" ON storage.objects;

-- ─── 8. SECURE APPROVE / REJECT FUNCTIONS ────────────────────
-- These run with SECURITY DEFINER so client can call them
-- but only if the calling user is admin (checked inside function)

CREATE OR REPLACE FUNCTION public.approve_payment(payment_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment   payments%ROWTYPE;
  v_admin_id  UUID;
BEGIN
  -- Must be authenticated
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Must be admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
  END IF;

  -- Fetch payment
  SELECT * INTO v_payment FROM payments WHERE id = payment_uuid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  -- Must be PENDING
  IF v_payment.status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment is not in PENDING state');
  END IF;

  -- Update payment
  UPDATE payments SET
    status      = 'PAID',
    verified_by = v_admin_id,
    verified_at = NOW(),
    updated_at  = NOW()
  WHERE id = payment_uuid;

  -- Unlock invitation
  UPDATE invitations SET
    payment_status = 'PAID',
    is_unlocked    = true,
    is_public      = true,
    payment_id     = payment_uuid,
    updated_at     = NOW()
  WHERE id = v_payment.invitation_id;

  -- Audit log
  INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_admin_id,
    'PAYMENT_APPROVED',
    'payment',
    payment_uuid::TEXT,
    jsonb_build_object(
      'amount', v_payment.amount,
      'transaction_id', v_payment.transaction_id,
      'invitation_id', v_payment.invitation_id
    )
  );

  RETURN jsonb_build_object('success', true, 'invitation_id', v_payment.invitation_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_payment(payment_uuid UUID, reason TEXT DEFAULT '')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment   payments%ROWTYPE;
  v_admin_id  UUID;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
  END IF;

  SELECT * INTO v_payment FROM payments WHERE id = payment_uuid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment is not in PENDING state');
  END IF;

  -- Reject payment
  UPDATE payments SET
    status           = 'REJECTED',
    rejection_reason = reason,
    verified_by      = v_admin_id,
    verified_at      = NOW(),
    updated_at       = NOW()
  WHERE id = payment_uuid;

  -- Set invitation back to allow retry
  UPDATE invitations SET
    payment_status = 'PENDING',
    is_unlocked    = false,
    is_public      = false,
    updated_at     = NOW()
  WHERE id = v_payment.invitation_id AND payment_id IS NOT DISTINCT FROM payment_uuid;

  -- Audit log
  INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_admin_id,
    'PAYMENT_REJECTED',
    'payment',
    payment_uuid::TEXT,
    jsonb_build_object(
      'amount', v_payment.amount,
      'transaction_id', v_payment.transaction_id,
      'reason', reason,
      'invitation_id', v_payment.invitation_id
    )
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── 9. REVENUE HELPER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_revenue_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total       NUMERIC;
  v_today       NUMERIC;
  v_this_week   NUMERIC;
  v_this_month  NUMERIC;
  v_pending_cnt INTEGER;
  v_paid_cnt    INTEGER;
  v_rejected_cnt INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('error', 'Admin required');
  END IF;

  SELECT COALESCE(SUM(amount),0) INTO v_total       FROM payments WHERE status='PAID';
  SELECT COALESCE(SUM(amount),0) INTO v_today       FROM payments WHERE status='PAID' AND created_at >= CURRENT_DATE;
  SELECT COALESCE(SUM(amount),0) INTO v_this_week   FROM payments WHERE status='PAID' AND created_at >= date_trunc('week', NOW());
  SELECT COALESCE(SUM(amount),0) INTO v_this_month  FROM payments WHERE status='PAID' AND created_at >= date_trunc('month', NOW());
  SELECT COUNT(*) INTO v_pending_cnt   FROM payments WHERE status='PENDING';
  SELECT COUNT(*) INTO v_paid_cnt      FROM payments WHERE status='PAID';
  SELECT COUNT(*) INTO v_rejected_cnt  FROM payments WHERE status='REJECTED';

  RETURN jsonb_build_object(
    'total_revenue',    v_total,
    'today_revenue',    v_today,
    'week_revenue',     v_this_week,
    'month_revenue',    v_this_month,
    'pending_count',    v_pending_cnt,
    'paid_count',       v_paid_cnt,
    'rejected_count',   v_rejected_cnt
  );
END;
$$;
