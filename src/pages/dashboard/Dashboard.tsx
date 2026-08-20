import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Share2, Heart, Flower2, FlameKindling } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { DashboardStats } from '../../types';

const statCards = [
  { key: 'total_invitations', label: 'आमंत्रणे', labelEn: 'Invitations', icon: '📜', color: '#ff7300' },
  { key: 'total_views', label: 'एकूण Views', labelEn: 'Total Views', icon: '👁️', color: '#d4a017' },
  { key: 'total_shares', label: 'Shares', labelEn: 'Total Shares', icon: '📱', color: '#2196f3' },
  { key: 'total_rsvp_yes', label: 'RSVP Yes', labelEn: 'Confirmed', icon: '🙏', color: '#27ae60' },
  { key: 'total_guest_count', label: 'एकूण Guests', labelEn: 'Guest Count', icon: '👥', color: '#9c27b0' },
  { key: 'total_flower_offerings', label: 'फुले', labelEn: 'Flowers', icon: '🌸', color: '#e91e63' },
  { key: 'total_diya_offerings', label: 'दिवे', labelEn: 'Diyas', icon: '🪔', color: '#ff9800' },
] as const;

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentInvitations, setRecentInvitations] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  async function loadStats() {
    if (!user) return;
    setLoadingStats(true);
    try {
      // Get invitations
      const { data: invs } = await supabase.from('invitations').select('id').eq('user_id', user.id);
      const invIds = (invs || []).map(i => i.id);

      const [views, shares, rsvps, flowers, diyas, recent] = await Promise.all([
        invIds.length ? supabase.from('invitation_views').select('*', { count: 'exact', head: true }).in('invitation_id', invIds) : { count: 0 },
        invIds.length ? supabase.from('invitation_shares').select('*', { count: 'exact', head: true }).in('invitation_id', invIds) : { count: 0 },
        invIds.length ? supabase.from('rsvps').select('guest_count').eq('response', 'yes').in('invitation_id', invIds) : { data: [] },
        invIds.length ? supabase.from('flower_offerings').select('*', { count: 'exact', head: true }).in('invitation_id', invIds) : { count: 0 },
        invIds.length ? supabase.from('diya_offerings').select('*', { count: 'exact', head: true }).in('invitation_id', invIds) : { count: 0 },
        supabase.from('invitations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const guestCount = (rsvps.data || []).reduce((sum, r) => sum + (r.guest_count || 0), 0);

      setStats({
        total_invitations: invIds.length,
        total_views: views.count || 0,
        total_shares: shares.count || 0,
        total_rsvp_yes: (rsvps.data || []).length,
        total_guest_count: guestCount,
        total_flower_offerings: flowers.count || 0,
        total_diya_offerings: diyas.count || 0,
      });
      setRecentInvitations(recent.data || []);
    } finally {
      setLoadingStats(false);
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>
              🪔 Dashboard
            </h1>
            <p className="text-sm text-amber-700 mt-0.5">Welcome back 🙏</p>
          </div>
          <Link to="/create" className="btn-saffron text-sm px-5 py-2.5">
            <Plus className="w-4 h-4" /> नवीन आमंत्रण
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="dashboard-stat-card"
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs text-amber-600 font-devanagari mb-1">{card.label}</p>
                  <p className="text-3xl font-bold tabular-nums" style={{ color: card.color }}>
                    {loadingStats ? '—' : (stats?.[card.key as keyof DashboardStats] || 0).toLocaleString('mr-IN')}
                  </p>
                  <p className="text-[10px] text-amber-400 mt-0.5">{card.labelEn}</p>
                </div>
                <span className="text-2xl opacity-70">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { to: '/dashboard/invitations', icon: '📜', label: 'आमंत्रणे', sub: 'Manage' },
            { to: '/dashboard/guests', icon: '👥', label: 'Guests', sub: 'Manage' },
            { to: '/dashboard/analytics', icon: '📊', label: 'Analytics', sub: 'View Stats' },
            { to: '/dashboard/memories', icon: '📷', label: 'आठवणी', sub: 'Memories' },
          ].map(nav => (
            <Link key={nav.to} to={nav.to}
              className="gold-card p-4 flex items-center gap-3 hover:-translate-y-1 transition-transform duration-200">
              <span className="text-2xl">{nav.icon}</span>
              <div>
                <p className="font-bold text-sm font-devanagari" style={{ color: '#3d1f00' }}>{nav.label}</p>
                <p className="text-xs text-amber-500">{nav.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent invitations */}
        <div className="gold-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>
              📜 अलीकडील आमंत्रणे
            </h2>
            <Link to="/dashboard/invitations" className="text-xs text-saffron-600 hover:text-saffron-700">सर्व पहा →</Link>
          </div>

          {recentInvitations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🙏</div>
              <p className="font-devanagari text-amber-700 mb-4">अजून कोणतेही आमंत्रण तयार केलेले नाही.</p>
              <Link to="/create" className="btn-saffron text-sm px-6 py-2.5">
                🙏 पहिले आमंत्रण तयार करा
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvitations.map(inv => (
                <div key={inv.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-amber-50 transition-colors"
                  style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
                  <div className="w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center text-xl flex-shrink-0">
                    🪔
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm font-devanagari truncate" style={{ color: '#3d1f00' }}>
                      {inv.host_name} — {inv.city}
                    </p>
                    <p className="text-xs text-amber-500">/invite/{inv.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/invite/${inv.slug}`} target="_blank"
                      className="p-2 rounded-lg hover:bg-amber-100" title="View">
                      <Eye className="w-4 h-4 text-amber-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
