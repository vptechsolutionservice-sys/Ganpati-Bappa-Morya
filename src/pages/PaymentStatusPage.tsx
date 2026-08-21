import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPaymentStatus, getLatestPaymentForInvitation } from '../lib/paymentService';
import type { Payment, PaymentStatus } from '../types';
import Navbar from '../components/layout/Navbar';
import { supabase } from '../lib/supabase';

// ─── TIMELINE STEP ────────────────────────────────────────────
type TimelineState = 'done' | 'active' | 'pending';

function TimelineStep({ state, label, sublabel }: { state: TimelineState; label: string; sublabel?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-500 ${
          state === 'done'
            ? 'bg-green-500 text-white'
            : state === 'active'
            ? 'text-white'
            : 'bg-gray-100 text-gray-400'
        }`}
          style={state === 'active' ? { background: 'linear-gradient(135deg, #ff9233, #ff7300)', boxShadow: '0 0 0 4px rgba(255,115,0,0.2)' } : {}}>
          {state === 'done' ? '✓' : state === 'active' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-base">⏳</motion.div>
          ) : '○'}
        </div>
      </div>
      <div className="pt-2 pb-6 flex-1">
        <p className={`font-semibold text-sm ${state === 'pending' ? 'text-gray-400' : ''}`}
          style={{ color: state === 'pending' ? undefined : '#3d1f00' }}>
          {label}
        </p>
        {sublabel && <p className="text-xs text-amber-600 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function PaymentStatusPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invitation, setInvitation] = useState<{ slug: string; host_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const load = useCallback(async () => {
    if (!paymentId) return;
    const p = await getPaymentStatus(paymentId);
    setPayment(p);
    if (p?.invitation_id && !invitation) {
      const { data } = await supabase
        .from('invitations')
        .select('slug, host_name')
        .eq('id', p.invitation_id)
        .single();
      if (data) setInvitation(data);
    }
    setLoading(false);
    return p?.status;
  }, [paymentId]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-poll every 15 seconds while PENDING
  useEffect(() => {
    if (!payment || payment.status !== 'PENDING') return;
    const interval = setInterval(async () => {
      const status = await load();
      setPollCount(c => c + 1);
      if (status && status !== 'PENDING') clearInterval(interval);
    }, 15000);
    return () => clearInterval(interval);
  }, [payment, load]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <div className="text-4xl animate-float">🙏</div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
        style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>Payment not found</h1>
        <Link to="/dashboard" className="btn-saffron mt-4 px-6 py-3">← Dashboard</Link>
      </div>
    );
  }

  const status = payment.status as PaymentStatus;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-8 space-y-5">

        {/* Status Header */}
        <AnimatePresence mode="wait">
          {status === 'PENDING' && (
            <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-6">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4">⏳</motion.div>
              <h1 className="text-2xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>Verification Pending</h1>
              <p className="text-amber-700 mt-2 text-sm font-devanagari">
                तुमचा payment request मिळाला आहे.<br />
                Admin verify केल्यानंतर invitation unlock होईल.
              </p>
              {pollCount > 0 && (
                <p className="text-xs text-amber-400 mt-2">Last checked just now • Auto-refreshing every 15s</p>
              )}
            </motion.div>
          )}

          {status === 'PAID' && (
            <motion.div key="paid" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} transition={{ type: 'spring', stiffness: 300 }}
                className="text-6xl mb-4">🎉</motion.div>
              <h1 className="text-2xl font-bold font-devanagari" style={{ color: '#16a34a' }}>Payment Approved!</h1>
              <p className="text-amber-700 mt-2 font-devanagari text-sm">
                तुमचे गणपती आमंत्रण आता शेअर करण्यासाठी तयार आहे! 🙏
              </p>
            </motion.div>
          )}

          {status === 'REJECTED' && (
            <motion.div key="rejected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-6">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold font-devanagari" style={{ color: '#dc2626' }}>Payment Verification Failed</h1>
              <p className="text-amber-700 mt-2 text-sm font-devanagari">
                तुमचा payment verify करता आला नाही.
              </p>
              {payment.rejection_reason && (
                <div className="mt-3 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
                  कारण: {payment.rejection_reason}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="gold-card p-6">
          <h2 className="font-bold mb-5" style={{ color: '#3d1f00' }}>📋 Payment Timeline</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-0 w-0.5" style={{ background: 'rgba(212,160,23,0.25)' }} />

            <TimelineStep state="done" label="Invitation Created" sublabel={invitation?.host_name} />
            <TimelineStep state="done" label="Payment Details Submitted"
              sublabel={`Transaction ID: ${payment.transaction_id}`} />
            <TimelineStep
              state={status === 'PENDING' ? 'active' : status === 'PAID' ? 'done' : 'done'}
              label="Payment Verification"
              sublabel={status === 'PENDING' ? 'Admin is reviewing...' : status === 'PAID' ? 'Verified ✓' : 'Rejected'}
            />
            <TimelineStep
              state={status === 'PAID' ? 'done' : 'pending'}
              label="Invitation Unlocked"
              sublabel={status === 'PAID' ? 'Unlocked! 🎉' : undefined}
            />
            <TimelineStep
              state={status === 'PAID' ? 'done' : 'pending'}
              label="Ready to Share"
            />
          </div>
        </motion.div>

        {/* Payment details card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="gold-card p-5 space-y-3">
          <h3 className="font-bold" style={{ color: '#3d1f00' }}>💰 Payment Details</h3>
          {[
            { label: 'Amount', value: `₹${payment.amount}` },
            { label: 'Transaction ID', value: payment.transaction_id, mono: true },
            { label: 'Status', value: status === 'PENDING' ? '⏳ Pending Verification' : status === 'PAID' ? '✅ PAID' : '❌ Rejected' },
            { label: 'Submitted', value: new Date(payment.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
            status === 'PAID' && payment.verified_at ? { label: 'Approved At', value: new Date(payment.verified_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) } : null,
          ].filter(Boolean).map((row: any) => (
            <div key={row.label} className="flex justify-between items-start gap-4 py-2 border-b last:border-0"
              style={{ borderColor: 'rgba(212,160,23,0.15)' }}>
              <span className="text-sm text-amber-600">{row.label}</span>
              <span className={`text-sm font-semibold text-right ${row.mono ? 'font-mono' : ''}`}
                style={{ color: '#3d1f00' }}>{row.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
          className="space-y-3">
          {status === 'PAID' && invitation?.slug && (
            <>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🙏 गणपती बाप्पा मोरया!\n\n${window.location.origin}/invite/${invitation.slug}\n\nगणपती बाप्पा मोरया! 🙏`)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-whatsapp w-full py-4 text-base"
              >
                📱 Share on WhatsApp
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.slug}`); }}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all"
                style={{ background: 'rgba(255,115,0,0.1)', border: '1px solid rgba(255,115,0,0.3)', color: '#ff6200' }}>
                🔗 Copy Invitation Link
              </button>
              <Link to={`/invite/${invitation.slug}`} target="_blank"
                className="block w-full py-3 text-center rounded-xl font-medium text-sm border transition-all hover:bg-amber-50"
                style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                👁️ View Invitation
              </Link>
            </>
          )}

          {status === 'REJECTED' && (
            <>
              {invitation && (
                <Link to={`/payment/${payment.invitation_id}`}
                  className="btn-saffron w-full py-4 text-base">
                  🔄 Try Again
                </Link>
              )}
              <Link to="/dashboard"
                className="block w-full py-3 text-center rounded-xl font-medium text-sm border transition-all hover:bg-amber-50"
                style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                ← Back to Dashboard
              </Link>
            </>
          )}

          {status === 'PENDING' && (
            <Link to="/dashboard"
              className="block w-full py-3 text-center rounded-xl font-medium text-sm border transition-all hover:bg-amber-50"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              ← Back to Dashboard
            </Link>
          )}
        </motion.div>

        {/* Receipt (PAID) */}
        {status === 'PAID' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="gold-card p-5 text-center">
            <h3 className="font-bold font-devanagari mb-3" style={{ color: '#3d1f00' }}>🧾 Payment Receipt</h3>
            <div className="space-y-1 text-sm text-amber-800">
              <p>Ganpati Invitation — {invitation?.host_name}</p>
              <p className="font-bold text-lg" style={{ color: '#16a34a' }}>₹{payment.amount} PAID ✓</p>
              <p className="font-mono text-xs">{payment.transaction_id}</p>
              <p className="text-xs text-amber-500">
                {new Date(payment.verified_at || payment.updated_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
