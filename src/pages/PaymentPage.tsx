import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { Copy, CheckCircle, Upload, X, Smartphone, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  getPaymentSettings,
  buildUpiUrl,
  submitPayment,
  uploadPaymentScreenshot,
  isTransactionIdUsed,
} from '../lib/paymentService';
import type { Invitation, PaymentSettings } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/ui/Toaster';
import Navbar from '../components/layout/Navbar';

// ─── QR CANVAS ────────────────────────────────────────────────
function QRCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 220,
        margin: 2,
        color: { dark: '#3d1f00', light: '#fffdf5' },
      });
    }
  }, [value]);
  return <canvas ref={canvasRef} className="rounded-2xl shadow-lg mx-auto block" style={{ border: '3px solid rgba(212,160,23,0.4)' }} />;
}

// ─── STEP BADGE ───────────────────────────────────────────────
function StepBadge({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #ff9233, #ff7300)' }}>
        {n}
      </div>
      <p className="text-sm text-amber-800 pt-0.5">{text}</p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function PaymentPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [upiUrl, setUpiUrl] = useState('');

  const [txId, setTxId] = useState('');
  const [txIdError, setTxIdError] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (invitationId) load();
  }, [invitationId]);

  async function load() {
    const [invResult, settingsResult] = await Promise.all([
      supabase.from('invitations').select('*').eq('id', invitationId).single(),
      getPaymentSettings(),
    ]);

    if (invResult.data) {
      const inv = invResult.data as Invitation;
      setInvitation(inv);
      // Already unlocked?
      if (inv.is_unlocked) {
        navigate(`/payment-status/${inv.payment_id || invitationId}`);
        return;
      }
    }

    setSettings(settingsResult);

    if (settingsResult.upi_id) {
      const ref = invitationId?.slice(0, 8).toUpperCase() || 'GANPATI';
      setUpiUrl(buildUpiUrl(settingsResult, ref));
    }

    setLoading(false);
  }

  function validateTxId(val: string): string {
    const v = val.trim();
    if (!v) return 'Transaction ID required';
    if (v.length < 6) return 'Transaction ID too short (min 6 characters)';
    if (v.length > 50) return 'Transaction ID too long (max 50 characters)';
    if (!/^[a-zA-Z0-9_\-./@ ]+$/.test(v)) return 'Invalid characters in Transaction ID';
    return '';
  }

  function handleTxChange(val: string) {
    setTxId(val);
    if (txIdError) setTxIdError(validateTxId(val));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, WebP allowed', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be under 5MB', 'error'); return;
    }
    setScreenshot(file);
    const url = URL.createObjectURL(file);
    setScreenshotPreview(url);
  }

  function removeScreenshot() {
    setScreenshot(null);
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function copyUpiId() {
    if (!settings?.upi_id) return;
    await navigator.clipboard.writeText(settings.upi_id);
    setCopied(true);
    showToast('UPI ID copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateTxId(txId);
    if (err) { setTxIdError(err); return; }

    setSubmitting(true);
    try {
      // Upload screenshot if present
      let screenshotUrl: string | undefined;
      if (screenshot && invitationId) {
        const url = await uploadPaymentScreenshot(screenshot, invitationId.slice(0, 8));
        screenshotUrl = url || undefined;
      }

      const { payment, error } = await submitPayment({
        userId: user?.id,
        invitationId: invitationId!,
        transactionId: txId,
        screenshotUrl,
        amount: settings?.invitation_price || 50,
      });

      if (error || !payment) {
        showToast(error || 'Submission failed', 'error');
        return;
      }

      showToast('Payment submitted! Awaiting verification 🙏', 'success');
      navigate(`/payment-status/${payment.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-float">🙏</div>
          <p className="text-amber-700 font-devanagari">Loading payment...</p>
        </div>
      </div>
    );
  }

  const price = settings?.invitation_price || 50;
  const upiId = settings?.upi_id || '';
  const payeeName = settings?.upi_payee_name || 'Ganpati Invitation';
  const configMissing = !upiId;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 60%, #fde8c8 100%)' }}>
      <Navbar />

      {/* Header */}
      <div className="text-center py-8 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl mb-3">🙏</motion.div>
        <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-2xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>
          बाप्पांचे आमंत्रण शेअर करा
        </motion.h1>
        <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-amber-700 mt-1 text-sm">
          Pay ₹{price} to unlock sharing & all premium features
        </motion.p>
      </div>

      <div className="max-w-md mx-auto px-4 pb-16 space-y-5">

        {/* Invitation preview card */}
        {invitation && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="gold-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff9233, #ff7300)' }}>
                {invitation.ganpati_image_url
                  ? <img src={invitation.ganpati_image_url} alt="Ganpati" className="w-full h-full object-cover" />
                  : <span className="text-3xl">🙏</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold font-devanagari truncate" style={{ color: '#3d1f00' }}>{invitation.host_name}</p>
                <p className="text-sm text-amber-700">{invitation.city}</p>
                <p className="text-xs text-amber-500">{invitation.arrival_date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold" style={{ color: '#ff7300' }}>₹{price}</p>
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <Lock className="w-3 h-3" /> Locked
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPI not configured */}
        {configMissing && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl p-5 flex items-start gap-3"
            style={{ background: 'rgba(255,115,0,0.08)', border: '1px solid rgba(255,115,0,0.25)' }}>
            <AlertCircle className="w-5 h-5 text-saffron-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm" style={{ color: '#3d1f00' }}>Payment not yet configured</p>
              <p className="text-xs text-amber-700 mt-1">The admin has not set up UPI payment details yet. Please check back soon or contact support.</p>
            </div>
          </motion.div>
        )}

        {/* QR Code */}
        {!configMissing && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
            className="gold-card p-6 text-center">
            <h2 className="font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>📱 Scan & Pay</h2>
            <p className="text-xs text-amber-600 mb-5">Google Pay, PhonePe, Paytm, BHIM कोणत्याही UPI app ने scan करा</p>

            {settings?.payment_qr_url ? (
              <img src={settings.payment_qr_url} alt="Payment QR" className="rounded-2xl shadow-lg mx-auto block max-w-[220px]" style={{ border: '3px solid rgba(212,160,23,0.4)' }} />
            ) : (
              <QRCanvas value={upiUrl} />
            )}

            <div className="mt-4">
              <p className="text-3xl font-bold" style={{ color: '#ff7300' }}>₹{price}</p>
              <p className="text-sm text-amber-600 mt-1">UPI: <span className="font-mono font-semibold" style={{ color: '#3d1f00' }}>{upiId}</span></p>
              <p className="text-xs text-amber-500 mt-0.5">{payeeName}</p>
            </div>

            {/* Copy UPI + Open App */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button onClick={copyUpiId}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: copied ? 'rgba(22,163,74,0.1)' : 'rgba(255,115,0,0.08)', border: `1px solid ${copied ? '#16a34a' : 'rgba(255,115,0,0.3)'}`, color: copied ? '#16a34a' : '#ff6200' }}>
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy UPI ID'}
              </button>
              <a href={upiUrl}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                <Smartphone className="w-4 h-4" />
                Open UPI App
              </a>
            </div>
          </motion.div>
        )}

        {/* Payment instructions */}
        {!configMissing && settings?.payment_instructions && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="gold-card p-5">
            <h3 className="font-bold mb-4" style={{ color: '#3d1f00' }}>📋 How to Pay</h3>
            <div className="space-y-3">
              <StepBadge n={1} text="वरील QR code scan करा" />
              <StepBadge n={2} text={`₹${price} exactly pay करा`} />
              <StepBadge n={3} text="Payment complete केल्यावर UPI app मध्ये transaction ID / UTR number पहा" />
              <StepBadge n={4} text="खाली Transaction ID enter करा" />
              <StepBadge n={5} text="Submit करा — verification नंतर invitation unlock होईल" />
            </div>
            {settings.payment_note && (
              <div className="mt-4 p-3 rounded-xl text-xs text-amber-700"
                style={{ background: 'rgba(255,115,0,0.06)', border: '1px solid rgba(255,115,0,0.15)' }}>
                ℹ️ {settings.payment_note}
              </div>
            )}
          </motion.div>
        )}

        {/* Transaction ID form */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
          className="gold-card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold" style={{ color: '#3d1f00' }}>✅ Payment Complete झाले का?</h3>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d1f00' }}>
                Transaction / UTR ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={txId}
                onChange={e => handleTxChange(e.target.value)}
                placeholder="e.g. 408718234567, T2608241234..."
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all outline-none"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderColor: txIdError ? '#dc2626' : 'rgba(212,160,23,0.4)',
                  color: '#3d1f00',
                }}
                onFocus={e => (e.target.style.borderColor = '#ff7300')}
                onBlur={e => (e.target.style.borderColor = txIdError ? '#dc2626' : 'rgba(212,160,23,0.4)')}
              />
              {txIdError && <p className="text-red-500 text-xs mt-1">{txIdError}</p>}
              <p className="text-xs text-amber-500 mt-1">UPI app → Transaction History → UTR/Reference number</p>
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d1f00' }}>
                Payment Screenshot <span className="text-amber-500 text-xs font-normal">(Optional)</span>
              </label>
              {screenshotPreview ? (
                <div className="relative">
                  <img src={screenshotPreview} alt="Screenshot" className="w-full max-h-40 object-contain rounded-xl border"
                    style={{ borderColor: 'rgba(212,160,23,0.3)' }} />
                  <button type="button" onClick={removeScreenshot}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:bg-amber-50"
                  style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#a07050' }}>
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Tap to upload screenshot</span>
                  <span className="text-xs text-amber-400">JPG, PNG, WebP • Max 5MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect} className="hidden" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || configMissing}
              className="btn-saffron w-full py-4 text-base"
            >
              {submitting ? (
                <><span className="animate-spin inline-block mr-2">⌛</span> Submitting...</>
              ) : (
                '🙏 Submit Payment'
              )}
            </button>

            <p className="text-xs text-center text-amber-500">
              Payment manually verified होते. सहसा 1-2 तासांत unlock होते.
            </p>
          </form>
        </motion.div>

        {/* Back link */}
        <div className="text-center pb-4">
          {invitation?.slug && (
            <Link to={`/invite/${invitation.slug}`} className="text-sm text-amber-600 hover:text-amber-800 underline underline-offset-2">
              ← Preview Invitation
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
