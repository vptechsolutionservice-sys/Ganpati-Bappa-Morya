/**
 * Payment Service — UPI Manual Provider (MVP)
 * Abstracted behind PaymentProvider interface for future gateway support.
 * Architecture: UPI_MANUAL → future: RAZORPAY, CASHFREE, PHONEPE
 */

import { supabase } from './supabase';
import type { Payment, PaymentSettings, PaymentStatus } from '../types';

// ─── PAYMENT PROVIDER ABSTRACTION ────────────────────────────
export type PaymentProviderType = 'UPI_MANUAL';

interface SubmitPaymentInput {
  userId?: string;
  invitationId: string;
  transactionId: string;
  screenshotUrl?: string;
  amount?: number;
}

// ─── SETTINGS ────────────────────────────────────────────────
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'invitation_price',
      'upi_id',
      'upi_payee_name',
      'payment_instructions',
      'support_contact',
      'payment_note',
      'payment_qr_url',
    ]);

  if (error || !data) {
    return {
      invitation_price: 50,
      upi_id: '',
      upi_payee_name: '',
      payment_instructions: '1. QR code scan करा\n2. ₹50 pay करा\n3. Transaction ID copy करा\n4. खाली enter करा\n5. Submit करा',
      support_contact: '',
      payment_note: 'Payment manually verified होते.',
    };
  }

  const map = Object.fromEntries(data.map(d => [d.key, d.value]));
  return {
    invitation_price: Number(map.invitation_price) || 50,
    upi_id: map.upi_id || '',
    upi_payee_name: map.upi_payee_name || '',
    payment_instructions: map.payment_instructions || '',
    support_contact: map.support_contact || '',
    payment_note: map.payment_note || '',
    payment_qr_url: map.payment_qr_url || undefined,
  };
}

export async function updatePaymentSetting(key: string, value: string): Promise<void> {
  await supabase
    .from('app_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
}

// ─── BUILD UPI DEEP LINK ──────────────────────────────────────
export function buildUpiUrl(settings: PaymentSettings, reference: string): string {
  const params = new URLSearchParams({
    pa: settings.upi_id,
    pn: settings.upi_payee_name || 'Ganpati Invitation',
    cu: 'INR',
    tn: `Ganpati Invitation - ${reference}`,
  });
  // Replace '+' with '%20' as some UPI apps do not support '+' for spaces
  return `upi://pay?${params.toString().replace(/\+/g, '%20')}`;
}

// ─── DUPLICATE TRANSACTION ID CHECK ──────────────────────────
export async function isTransactionIdUsed(transactionId: string): Promise<boolean> {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('transaction_id', transactionId.trim())
    .single();
  return !!data;
}

export async function uploadPaymentScreenshot(file: File, paymentRef: string): Promise<string | null> {
  // Compress if > 2MB using canvas
  let uploadFile = file;
  if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
    uploadFile = await compressImage(file, 0.7) || file;
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${paymentRef}-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('payment-screenshots')
    .upload(path, uploadFile, { upsert: true });

  if (error || !data) return null;

  const { data: { publicUrl } } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadPaymentQRCode(file: File): Promise<string | null> {
  let uploadFile = file;
  if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
    uploadFile = await compressImage(file, 0.7) || file;
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `payment-qr-${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('invitation-assets')
    .upload(path, uploadFile, { upsert: true });

  if (error || !data) return null;

  const { data: { publicUrl } } = supabase.storage
    .from('invitation-assets')
    .getPublicUrl(data.path);

  return publicUrl;
}

async function compressImage(file: File, quality: number): Promise<File | null> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1200;
      let { width, height } = img;
      if (width > max) { height = (height * max) / width; width = max; }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) { resolve(null); return; }
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ─── SUBMIT PAYMENT (UPI MANUAL) ──────────────────────────────
export async function submitPayment(input: SubmitPaymentInput): Promise<{ payment: Payment | null; error: string | null }> {
  const { userId, invitationId, transactionId, screenshotUrl, amount = 50 } = input;
  const trimmedTxId = transactionId.trim();

  // Duplicate check
  const isDuplicate = await isTransactionIdUsed(trimmedTxId);
  if (isDuplicate) {
    return { payment: null, error: 'This transaction ID has already been submitted. Please check your ID or contact support.' };
  }

  // Create payment record
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId || null,
      invitation_id: invitationId,
      amount,
      currency: 'INR',
      transaction_id: trimmedTxId,
      payment_screenshot_url: screenshotUrl || null,
      status: 'PENDING',
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Payment insert error:', error);
    return { payment: null, error: error?.message || 'Payment submission failed. Please try again.' };
  }

  // Update invitation to payment_status = PENDING, payment_id
  await supabase
    .from('invitations')
    .update({
      payment_status: 'PENDING',
      payment_id: data.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId);

  return { payment: data as Payment, error: null };
}

// ─── POLL PAYMENT STATUS ──────────────────────────────────────
export async function getPaymentStatus(paymentId: string): Promise<Payment | null> {
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();
  return data || null;
}

// ─── GET PAYMENT FOR INVITATION ───────────────────────────────
export async function getLatestPaymentForInvitation(invitationId: string): Promise<Payment | null> {
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data || null;
}

// ─── ADMIN: APPROVE ───────────────────────────────────────────
export async function adminApprovePayment(paymentId: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('approve_payment', { payment_uuid: paymentId });
  if (error) return { success: false, error: error.message };
  const result = data as { success: boolean; error?: string };
  return result;
}

// ─── ADMIN: REJECT ────────────────────────────────────────────
export async function adminRejectPayment(paymentId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('reject_payment', { payment_uuid: paymentId, reason });
  if (error) return { success: false, error: error.message };
  const result = data as { success: boolean; error?: string };
  return result;
}

// ─── STATUS HELPERS ───────────────────────────────────────────
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending Verification',
  PAID: 'Payment Approved ✓',
  REJECTED: 'Payment Rejected',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: '#f59e0b',
  PAID: '#16a34a',
  REJECTED: '#dc2626',
  REFUNDED: '#6b7280',
};

export const REJECTION_REASONS = [
  'Transaction not found',
  'Wrong amount paid',
  'Invalid transaction ID',
  'Duplicate payment',
  'Payment already cancelled',
  'Screenshot does not match',
  'Other',
];
