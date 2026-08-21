import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';

function exportCsv(rows: any[]) {
  const headers = ['Date', 'Customer', 'Email', 'Invitation', 'Amount', 'Transaction ID', 'Status', 'Verified At'];
  const csvRows = [
    headers.join(','),
    ...rows.map(r => [
      new Date(r.created_at).toLocaleDateString('en-IN'),
      `"${r.users?.name || ''}"`,
      `"${r.users?.email || ''}"`,
      `"${r.invitations?.host_name || ''}"`,
      r.amount,
      r.transaction_id,
      r.status,
      r.verified_at ? new Date(r.verified_at).toLocaleDateString('en-IN') : '',
    ].join(',')),
  ].join('\n');
  const blob = new Blob([csvRows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ganpati-payments-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('payments')
      .select(`*, users:user_id(name,email), invitations:invitation_id(host_name,city)`)
      .in('status', ['PAID', 'REJECTED', 'REFUNDED'])
      .order('updated_at', { ascending: false })
      .limit(500);
    setPayments(data || []);
    setLoading(false);
  }

  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#3d1f00' }}>📋 Payment History</h1>
            <p className="text-sm text-amber-700 mt-0.5">Approved & rejected payments</p>
          </div>
          <button onClick={() => exportCsv(payments)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-amber-50"
            style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Revenue summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue}`, color: '#16a34a' },
            { label: 'Paid', value: payments.filter(p => p.status === 'PAID').length, color: '#16a34a' },
            { label: 'Rejected', value: payments.filter(p => p.status === 'REJECTED').length, color: '#dc2626' },
          ].map(card => (
            <div key={card.label} className="dashboard-stat-card">
              <p className="text-xs text-amber-600 mb-1">{card.label}</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="text-4xl animate-float">🙏</div></div>
        ) : payments.length === 0 ? (
          <div className="gold-card p-12 text-center">
            <p className="text-amber-600">No payment history yet</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="gold-card overflow-hidden hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold text-amber-600"
                    style={{ borderColor: 'rgba(212,160,23,0.2)', background: 'rgba(255,115,0,0.03)' }}>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Invitation</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                      className="border-b hover:bg-amber-50 transition-colors"
                      style={{ borderColor: 'rgba(212,160,23,0.12)' }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm" style={{ color: '#3d1f00' }}>{p.users?.name || '—'}</p>
                        <p className="text-xs text-amber-500">{p.users?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#3d1f00' }}>{p.invitations?.host_name || '—'}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#ff7300' }}>₹{p.amount}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#3d1f00' }}>{p.transaction_id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold text-white"
                          style={{ background: p.status === 'PAID' ? '#16a34a' : '#dc2626' }}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-600">
                        {p.verified_at ? new Date(p.verified_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/payments/${p.id}`}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-amber-50"
                          style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="gold-card p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: '#3d1f00' }}>{p.users?.name || '—'}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: p.status === 'PAID' ? '#16a34a' : '#dc2626' }}>{p.status}</span>
                  </div>
                  <p className="text-xs text-amber-600">₹{p.amount} • {p.transaction_id}</p>
                  <p className="text-xs text-amber-500">{p.invitations?.host_name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
