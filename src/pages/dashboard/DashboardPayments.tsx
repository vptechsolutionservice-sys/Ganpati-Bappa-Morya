import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:  { bg: 'rgba(245,158,11,0.12)', color: '#b45309', label: '⏳ Pending' },
    PAID:     { bg: 'rgba(22,163,74,0.12)',  color: '#15803d', label: '✅ Approved' },
    REJECTED: { bg: 'rgba(220,38,38,0.12)', color: '#b91c1c', label: '❌ Rejected' },
    REFUNDED: { bg: 'rgba(107,114,128,0.12)', color: '#4b5563', label: '↩️ Refunded' },
  };
  const c = map[status] || map.PENDING;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function DashboardPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    const { data } = await supabase
      .from('payments')
      .select(`*, invitations:invitation_id(host_name, city, slug)`)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <p className="text-amber-700 mb-4">Please sign in to view payments</p>
        <Link to="/" className="btn-saffron px-6 py-3">← Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>💳 माझे Payments</h1>
          <p className="text-sm text-amber-700 mt-1">Your payment history</p>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="text-4xl animate-float">🙏</div></div>
        ) : payments.length === 0 ? (
          <div className="gold-card p-10 text-center">
            <div className="text-4xl mb-3">💳</div>
            <p className="font-devanagari text-amber-700 mb-5">अजून कोणताही payment नाही</p>
            <Link to="/create" className="btn-saffron px-6 py-3">🙏 Invitation तयार करा</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="gold-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>
                      {p.invitations?.host_name || 'Unknown Invitation'}
                    </p>
                    <p className="text-xs text-amber-500">{p.invitations?.city}</p>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="text-xs text-amber-400">Amount</span>
                    <p className="font-bold" style={{ color: '#ff7300' }}>₹{p.amount}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-400">Submitted</span>
                    <p className="text-sm" style={{ color: '#3d1f00' }}>
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-amber-400">Transaction ID</span>
                    <p className="font-mono text-sm" style={{ color: '#3d1f00' }}>{p.transaction_id}</p>
                  </div>
                  {p.rejection_reason && (
                    <div className="col-span-2">
                      <span className="text-xs text-amber-400">Rejection Reason</span>
                      <p className="text-sm" style={{ color: '#dc2626' }}>{p.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link to={`/payment-status/${p.id}`}
                    className="flex-1 py-2 text-center rounded-xl text-sm font-medium border transition-all hover:bg-amber-50"
                    style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                    View Status
                  </Link>
                  {p.status === 'REJECTED' && p.invitations?.slug && (
                    <Link to={`/payment/${p.invitation_id}`}
                      className="flex-1 py-2 text-center rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg,#ff9233,#ff7300)' }}>
                      🔄 Try Again
                    </Link>
                  )}
                  {p.status === 'PAID' && p.invitations?.slug && (
                    <Link to={`/invite/${p.invitations.slug}`} target="_blank"
                      className="flex-1 py-2 text-center rounded-xl text-sm font-semibold text-white"
                      style={{ background: '#16a34a' }}>
                      📱 Share
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
