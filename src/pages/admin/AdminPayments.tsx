import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import type { Payment, PaymentStatus } from '../../types';
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '../../lib/paymentService';

type FilterStatus = 'ALL' | PaymentStatus;
type FilterDate = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH';

function StatusBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, { bg: string; color: string; icon: React.ReactNode }> = {
    PENDING:  { bg: 'rgba(245,158,11,0.12)',  color: '#b45309', icon: <Clock className="w-3 h-3" /> },
    PAID:     { bg: 'rgba(22,163,74,0.12)',   color: '#15803d', icon: <CheckCircle className="w-3 h-3" /> },
    REJECTED: { bg: 'rgba(220,38,38,0.12)',   color: '#b91c1c', icon: <XCircle className="w-3 h-3" /> },
    REFUNDED: { bg: 'rgba(107,114,128,0.12)', color: '#4b5563', icon: null },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      {c.icon}{status}
    </span>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [filterDate, setFilterDate] = useState<FilterDate>('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('payments')
      .select(`
        *,
        users:user_id ( name, email ),
        invitations:invitation_id ( host_name, city, slug )
      `)
      .order('created_at', { ascending: false });

    if (filterStatus !== 'ALL') q = q.eq('status', filterStatus);

    const now = new Date();
    if (filterDate === 'TODAY') {
      q = q.gte('created_at', new Date(now.setHours(0,0,0,0)).toISOString());
    } else if (filterDate === 'YESTERDAY') {
      const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0,0,0,0);
      const end   = new Date(now); end.setHours(0,0,0,0);
      q = q.gte('created_at', start.toISOString()).lt('created_at', end.toISOString());
    } else if (filterDate === 'WEEK') {
      const start = new Date(now); start.setDate(start.getDate() - 7);
      q = q.gte('created_at', start.toISOString());
    } else if (filterDate === 'MONTH') {
      const start = new Date(now); start.setDate(1); start.setHours(0,0,0,0);
      q = q.gte('created_at', start.toISOString());
    }

    const { data } = await q.limit(200);
    setPayments(data || []);
    setLoading(false);
  }, [filterStatus, filterDate]);

  useEffect(() => { load(); }, [load]);

  const filtered = payments.filter(p => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.users?.name?.toLowerCase().includes(s) ||
      p.users?.email?.toLowerCase().includes(s) ||
      p.transaction_id?.toLowerCase().includes(s) ||
      p.invitation_id?.toLowerCase().includes(s) ||
      p.id?.toLowerCase().includes(s)
    );
  });

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#3d1f00' }}>💳 Payments</h1>
              <p className="text-sm text-amber-700 mt-0.5">
                {pendingCount > 0 && (
                  <span className="text-orange-600 font-semibold">{pendingCount} pending verification</span>
                )}
                {pendingCount === 0 && 'All payments reviewed'}
              </p>
            </div>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-amber-50"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="gold-card p-4 mb-5">
          <div className="flex flex-wrap gap-3">
            {/* Status filter */}
            <div className="flex gap-1 flex-wrap">
              {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as FilterStatus[]).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? 'text-white' : 'bg-white border text-amber-700 hover:bg-amber-50'}`}
                  style={filterStatus === s ? {
                    background: s === 'PENDING' ? '#f59e0b' : s === 'PAID' ? '#16a34a' : s === 'REJECTED' ? '#dc2626' : 'linear-gradient(135deg,#ff9233,#ff7300)',
                    border: 'none',
                  } : { borderColor: 'rgba(212,160,23,0.3)' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Date filter */}
            <select value={filterDate} onChange={e => setFilterDate(e.target.value as FilterDate)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>

            {/* Search */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 flex-1 min-w-40 bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)' }}>
              <Search className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <input type="text" placeholder="Search name, TX ID, invitation ID..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none" style={{ color: '#3d1f00' }} />
            </div>
          </div>
        </div>

        {/* Table — desktop */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 animate-float">🙏</div>
            <p className="text-amber-600">Loading payments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 gold-card">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-amber-600">No payments found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="gold-card overflow-hidden hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold text-amber-600"
                    style={{ borderColor: 'rgba(212,160,23,0.2)', background: 'rgba(255,115,0,0.03)' }}>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Invitation</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-amber-50 transition-colors"
                      style={{ borderColor: 'rgba(212,160,23,0.12)' }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold" style={{ color: '#3d1f00' }}>{p.users?.name || 'Unknown'}</p>
                        <p className="text-xs text-amber-500">{p.users?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: '#3d1f00' }}>{p.invitations?.host_name || '—'}</p>
                        <p className="text-xs text-amber-500">{p.invitations?.city}</p>
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#ff7300' }}>₹{p.amount}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs" style={{ color: '#3d1f00' }}>{p.transaction_id}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-600 whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        <br />{new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/payments/${p.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: p.status === 'PENDING' ? 'linear-gradient(135deg,#ff9233,#ff7300)' : '#6b7280' }}>
                          <Eye className="w-3 h-3" />
                          {p.status === 'PENDING' ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }} className="gold-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold" style={{ color: '#3d1f00' }}>{p.users?.name || 'Unknown'}</p>
                      <p className="text-xs text-amber-500">{p.invitations?.host_name || 'Unknown Invitation'}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-amber-700 mb-3">
                    <div><span className="text-amber-400">Amount: </span><span className="font-bold text-saffron-600">₹{p.amount}</span></div>
                    <div><span className="text-amber-400">Date: </span>{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                    <div className="col-span-2"><span className="text-amber-400">UTR: </span><span className="font-mono">{p.transaction_id}</span></div>
                  </div>
                  <Link to={`/admin/payments/${p.id}`}
                    className="block w-full text-center py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: p.status === 'PENDING' ? 'linear-gradient(135deg,#ff9233,#ff7300)' : '#6b7280' }}>
                    {p.status === 'PENDING' ? '📋 Review Payment' : '👁️ View Details'}
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 text-xs text-amber-500 text-right">
          Showing {filtered.length} of {payments.length} payments
        </div>
      </div>
    </AdminLayout>
  );
}
