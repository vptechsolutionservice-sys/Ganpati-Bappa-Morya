import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { adminApprovePayment, adminRejectPayment, REJECTION_REASONS } from '../../lib/paymentService';
import { showToast } from '../../components/ui/Toaster';

type ModalType = 'approve' | 'reject' | null;

export default function AdminPaymentReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        users:user_id ( id, name, email ),
        invitations:invitation_id ( id, host_name, city, slug, arrival_date, is_unlocked, payment_status )
      `)
      .eq('id', id)
      .single();
    setPayment(data);
    setLoading(false);
  }

  async function handleApprove() {
    if (!id) return;
    setProcessing(true);
    const { success, error } = await adminApprovePayment(id);
    if (success) {
      showToast('✅ Payment approved! Invitation unlocked.', 'success');
      setModal(null);
      await load();
    } else {
      showToast(error || 'Approval failed', 'error');
    }
    setProcessing(false);
  }

  async function handleReject() {
    if (!id) return;
    const reason = rejectionReason === 'Other' ? customReason : rejectionReason;
    if (!reason.trim()) { showToast('Please select a rejection reason', 'error'); return; }
    setProcessing(true);
    const { success, error } = await adminRejectPayment(id, reason);
    if (success) {
      showToast('Payment rejected.', 'success');
      setModal(null);
      await load();
    } else {
      showToast(error || 'Rejection failed', 'error');
    }
    setProcessing(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <div className="text-4xl animate-float">🙏</div>
        </div>
      </AdminLayout>
    );
  }

  if (!payment) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-amber-600">Payment not found</p>
          <Link to="/admin/payments" className="btn-saffron mt-4 px-6 py-3">← Back</Link>
        </div>
      </AdminLayout>
    );
  }

  const isPending = payment.status === 'PENDING';

  return (
    <AdminLayout>
      {/* Confirmation modals */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="gold-card p-6 w-full max-w-sm">
              {modal === 'approve' ? (
                <>
                  <div className="text-center mb-5">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-bold" style={{ color: '#3d1f00' }}>Confirm Approval</h3>
                    <p className="text-sm text-amber-700 mt-2">
                      Are you sure this <strong>₹{payment.amount}</strong> payment has been received?
                    </p>
                    <div className="mt-3 p-3 rounded-xl text-xs text-amber-700"
                      style={{ background: 'rgba(255,115,0,0.06)', border: '1px solid rgba(255,115,0,0.15)' }}>
                      Transaction ID: <span className="font-mono font-semibold">{payment.transaction_id}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setModal(null)} disabled={processing}
                      className="flex-1 py-3 rounded-xl border font-medium text-sm transition-all hover:bg-gray-50"
                      style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                      Cancel
                    </button>
                    <button onClick={handleApprove} disabled={processing}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                      style={{ background: '#16a34a' }}>
                      {processing ? '⌛ Processing...' : '✅ Confirm Approval'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-5">
                    <div className="text-4xl mb-3">❌</div>
                    <h3 className="text-lg font-bold" style={{ color: '#3d1f00' }}>Reject Payment?</h3>
                    <p className="text-sm text-amber-700 mt-2">Select a reason for rejection</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {REJECTION_REASONS.map(r => (
                      <label key={r} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                        rejectionReason === r ? 'border-red-400 bg-red-50' : 'hover:bg-amber-50'
                      }`} style={rejectionReason !== r ? { borderColor: 'rgba(212,160,23,0.25)' } : {}}>
                        <input type="radio" name="reason" value={r}
                          checked={rejectionReason === r} onChange={() => setRejectionReason(r)}
                          className="accent-red-500" />
                        <span className="text-sm" style={{ color: '#3d1f00' }}>{r}</span>
                      </label>
                    ))}
                    {rejectionReason === 'Other' && (
                      <textarea value={customReason} onChange={e => setCustomReason(e.target.value)}
                        placeholder="Describe the reason..."
                        className="w-full p-3 rounded-xl border text-sm resize-none outline-none"
                        style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00', background: 'rgba(255,255,255,0.8)' }}
                        rows={3} />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setModal(null); setRejectionReason(''); }} disabled={processing}
                      className="flex-1 py-3 rounded-xl border font-medium text-sm hover:bg-gray-50"
                      style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                      Cancel
                    </button>
                    <button onClick={handleReject} disabled={processing || !rejectionReason}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                      style={{ background: '#dc2626' }}>
                      {processing ? '⌛...' : '❌ Reject'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl">
        {/* Back + header */}
        <div className="mb-6">
          <Link to="/admin/payments" className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Payments
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#3d1f00' }}>💳 Payment Review</h1>
              <p className="text-xs text-amber-500 font-mono mt-0.5">{payment.id}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold text-white`}
              style={{ background: payment.status === 'PAID' ? '#16a34a' : payment.status === 'REJECTED' ? '#dc2626' : '#f59e0b' }}>
              {payment.status}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Customer */}
          <div className="gold-card p-5">
            <h2 className="font-bold mb-4 text-sm text-amber-600 uppercase tracking-wide">👤 Customer</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Name', value: payment.users?.name || 'Unknown' },
                { label: 'Email', value: payment.users?.email || '—' },
              ].map(r => (
                <div key={r.label}>
                  <p className="text-xs text-amber-500 mb-0.5">{r.label}</p>
                  <p className="font-semibold text-sm" style={{ color: '#3d1f00' }}>{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Invitation */}
          <div className="gold-card p-5">
            <h2 className="font-bold mb-4 text-sm text-amber-600 uppercase tracking-wide">📜 Invitation</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Host Name', value: payment.invitations?.host_name || '—' },
                { label: 'City', value: payment.invitations?.city || '—' },
                { label: 'Arrival Date', value: payment.invitations?.arrival_date || '—' },
                { label: 'Payment Status', value: payment.invitations?.payment_status || '—' },
              ].map(r => (
                <div key={r.label}>
                  <p className="text-xs text-amber-500 mb-0.5">{r.label}</p>
                  <p className="font-semibold text-sm" style={{ color: '#3d1f00' }}>{r.value}</p>
                </div>
              ))}
            </div>
            {payment.invitations?.slug && (
              <Link to={`/invite/${payment.invitations.slug}`} target="_blank"
                className="mt-3 flex items-center gap-1.5 text-sm text-saffron-600 hover:text-saffron-700">
                <ExternalLink className="w-3.5 h-3.5" /> View Invitation
              </Link>
            )}
          </div>

          {/* Payment */}
          <div className="gold-card p-5">
            <h2 className="font-bold mb-4 text-sm text-amber-600 uppercase tracking-wide">💰 Payment Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Amount', value: `₹${payment.amount} ${payment.currency}` },
                { label: 'Transaction ID', value: payment.transaction_id, mono: true },
                { label: 'Submitted', value: new Date(payment.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
                payment.verified_at ? { label: 'Verified At', value: new Date(payment.verified_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) } : null,
                payment.rejection_reason ? { label: 'Rejection Reason', value: payment.rejection_reason } : null,
              ].filter(Boolean).map((r: any) => (
                <div key={r.label}>
                  <p className="text-xs text-amber-500 mb-0.5">{r.label}</p>
                  <p className={`font-semibold text-sm ${r.mono ? 'font-mono' : ''}`} style={{ color: '#3d1f00' }}>{r.value}</p>
                </div>
              ))}
            </div>

            {/* Screenshot */}
            {payment.payment_screenshot_url && (
              <div className="mt-4">
                <p className="text-xs text-amber-500 mb-2">Payment Screenshot</p>
                <img src={payment.payment_screenshot_url} alt="Payment Screenshot"
                  className="max-h-48 rounded-xl border object-contain"
                  style={{ borderColor: 'rgba(212,160,23,0.3)' }} />
              </div>
            )}
          </div>

          {/* Actions */}
          {isPending && (
            <div className="gold-card p-5">
              <h2 className="font-bold mb-2" style={{ color: '#3d1f00' }}>⚡ Admin Actions</h2>
              <p className="text-xs text-amber-600 mb-5">
                Verify the UPI transaction in your bank/UPI app before approving.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal('approve')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 15px rgba(22,163,74,0.35)' }}>
                  <CheckCircle className="w-5 h-5" /> Approve Payment
                </button>
                <button onClick={() => setModal('reject')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)', boxShadow: '0 4px 15px rgba(220,38,38,0.3)' }}>
                  <XCircle className="w-5 h-5" /> Reject Payment
                </button>
              </div>
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl text-xs"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700">
                  Approval will immediately unlock the invitation and enable sharing for the customer.
                  This action is logged and cannot be auto-reversed.
                </p>
              </div>
            </div>
          )}

          {!isPending && (
            <div className="gold-card p-5 text-center">
              <p className="text-sm font-semibold" style={{ color: payment.status === 'PAID' ? '#16a34a' : '#dc2626' }}>
                {payment.status === 'PAID' ? '✅ Payment approved & invitation unlocked.' : '❌ Payment rejected.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
