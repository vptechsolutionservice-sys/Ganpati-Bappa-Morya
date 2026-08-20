import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';

const STAT_CARDS = [
  { key: 'users', label: 'Total Users', icon: '👥', color: '#2196f3' },
  { key: 'invitations', label: 'Invitations', icon: '📜', color: '#ff7300' },
  { key: 'views', label: 'Total Views', icon: '👁️', color: '#9c27b0' },
  { key: 'rsvps', label: 'Total RSVPs', icon: '🙏', color: '#27ae60' },
  { key: 'flowers', label: 'Flowers', icon: '🌸', color: '#e91e63' },
  { key: 'diyas', label: 'Diyas', icon: '🪔', color: '#ff9800' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentInvitations, setRecentInvitations] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const [users, invs, views, rsvps, flowers, diyas, recentU, recentI] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('invitations').select('*', { count: 'exact', head: true }),
      supabase.from('invitation_views').select('*', { count: 'exact', head: true }),
      supabase.from('rsvps').select('*', { count: 'exact', head: true }),
      supabase.from('flower_offerings').select('*', { count: 'exact', head: true }),
      supabase.from('diya_offerings').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('id, email, name, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('invitations').select('id, host_name, city, slug, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      users: users.count || 0,
      invitations: invs.count || 0,
      views: views.count || 0,
      rsvps: rsvps.count || 0,
      flowers: flowers.count || 0,
      diyas: diyas.count || 0,
    });
    setRecentUsers(recentU.data || []);
    setRecentInvitations(recentI.data || []);
    setLoading(false);
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d1f00' }}>📊 Admin Dashboard</h1>
          <p className="text-sm text-amber-700">Platform overview — Ganpati Invitation</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map((card, i) => (
            <motion.div key={card.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="dashboard-stat-card">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs text-amber-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold tabular-nums" style={{ color: card.color }}>
                    {loading ? '—' : stats[card.key]?.toLocaleString() || '0'}
                  </p>
                </div>
                <span className="text-2xl opacity-70">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="gold-card p-6">
            <h2 className="font-bold mb-4" style={{ color: '#3d1f00' }}>👥 Recent Users</h2>
            {recentUsers.length === 0 ? <p className="text-amber-500 text-sm">No users yet.</p> : (
              <div className="space-y-2">
                {recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50">
                    <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-sm font-bold text-saffron-600">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#3d1f00' }}>{u.name || 'Unknown'}</p>
                      <p className="text-xs text-amber-500">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invitations */}
          <div className="gold-card p-6">
            <h2 className="font-bold mb-4" style={{ color: '#3d1f00' }}>📜 Recent Invitations</h2>
            {recentInvitations.length === 0 ? <p className="text-amber-500 text-sm">No invitations yet.</p> : (
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
