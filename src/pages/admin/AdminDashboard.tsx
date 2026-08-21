import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';

const STAT_CARDS = [
  { key: 'users',        label: 'Total Users',       icon: '👥', color: '#2196f3' },
  { key: 'invitations',  label: 'Invitations',        icon: '📜', color: '#ff7300' },
  { key: 'pending',      label: 'Pending Payments',   icon: '⏳', color: '#f59e0b' },
  { key: 'paid',         label: 'Approved Payments',  icon: '✅', color: '#16a34a' },
  { key: 'rejected',     label: 'Rejected Payments',  icon: '❌', color: '#dc2626' },
  { key: 'revenue',      label: 'Total Revenue (₹)',  icon: '💰', color: '#7c3aed' },
  { key: 'today',        label: "Today's Revenue (₹)", icon: '📈', color: '#0891b2' },
  { key: 'views',        label: 'Total Views',         icon: '👁️', color: '#9c27b0' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentInvitations, setRecentInvitations] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);

    const [users, invs, views, pendingPay, paidPay, rejectedPay, revAll, revToday, recentP, recentI] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('invitations').select('*', { count: 'exact', head: true }),
      supabase.from('invitation_views').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'PAID'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
      supabase.from('payments').select('amount').eq('status', 'PAID'),
      supabase.from('payments').select('amount').eq('status', 'PAID').gte('created_at', todayStart.toISOString()),
      supabase.from('payments')
        .select(`*, users:user_id(name), invitations:invitation_id(host_name)`)
        .order('created_at', { ascending: false }).limit(5),
      supabase.from('invitations').select('id, host_name, city, slug, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const totalRevenue = (revAll.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
    const todayRevenue = (revToday.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);

    setStats({
      users: users.count || 0,
      invitations: invs.count || 0,
      views: views.count || 0,
      pending: pendingPay.count || 0,
      paid: paidPay.count || 0,
      rejected: rejectedPay.count || 0,
      revenue: totalRevenue,
      today: todayRevenue,
    });
    setRecentPayments(recentP.data || []);
    setRecentInvitations(recentI.data || []);
    setLoading(false);
  }

  const hasPending = (stats.pending || 0) > 0;

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d1f00' }}>📊 Admin Dashboard</h1>
          <p className="text-sm text-amber-700">Platform overview — Ganpati Invitation</p>
          {hasPending && (
            <Link to="/admin/payments"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white animate-pulse"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              ⏳ {stats.pending} payment{stats.pending > 1 ? 's' : ''} pending review →
            </Link>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((card, i) => (
            <motion.div key={card.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="dashboard-stat-card">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs text-amber-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>
                    {loading ? '—' : (card.key === 'revenue' || card.key === 'today')
                      ? `₹${stats[card.key]?.toLocaleString('en-IN') || '0'}`
                      : stats[card.key]?.toLocaleString() || '0'}
                  </p>
                </div>
                <span className="text-2xl opacity-70">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="gold-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold" style={{ color: '#3d1f00' }}>💳 Recent Payments</h2>
              <Link to="/admin/payments" className="text-xs text-saffron-600 hover:text-saffron-700">View all →</Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-amber-500 text-sm">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map(p => (
                  <Link to={`/admin/payments/${p.id}`} key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0`}
                      style={{ background: p.status === 'PAID' ? 'rgba(22,163,74,0.15)' : p.status === 'REJECTED' ? 'rgba(220,38,38,0.15)' : 'rgba(245,158,11,0.15)' }}>
                      {p.status === 'PAID' ? '✅' : p.status === 'REJECTED' ? '❌' : '⏳'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#3d1f00' }}>{p.users?.name || 'Unknown'}</p>
                      <p className="text-xs text-amber-500">{p.invitations?.host_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: '#ff7300' }}>₹{p.amount}</p>
                      <p className="text-xs text-amber-400">{p.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invitations */}
          <div className="gold-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold" style={{ color: '#3d1f00' }}>📜 Recent Invitations</h2>
              <Link to="/admin/invitations" className="text-xs text-saffron-600 hover:text-saffron-700">View all →</Link>
            </div>
            {recentInvitations.length === 0 ? (
              <p className="text-amber-500 text-sm">No invitations yet.</p>
            ) : (
              <div className="space-y-2">
                {recentInvitations.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50">
                    <span className="text-xl">🪔</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-devanagari truncate" style={{ color: '#3d1f00' }}>{inv.host_name}</p>
                      <p className="text-xs text-amber-500">{inv.city} • {inv.status}</p>
                    </div>
                    <a href={`/invite/${inv.slug}`} target="_blank" className="text-xs text-saffron-600">View →</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
