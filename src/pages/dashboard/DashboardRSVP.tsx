import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Trash2, RefreshCw, ArrowLeft, X } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  getRSVPStats,
  getRSVPsForInvitation,
  deleteRSVP,
  exportRSVPCsv,
  STATUS_LABELS,
} from '../../lib/rsvpService';
import type { RSVP, RSVPStatus, RSVPStats } from '../../types';
import type { SortOption } from '../../lib/rsvpService';
import { showToast } from '../../components/ui/Toaster';

// ─── STATUS PILL ─────────────────────────────────────────────
function StatusPill({ status }: { status: RSVPStatus }) {
  const s = STATUS_LABELS[status];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${s.color}18`, color: s.color }}>
      {s.icon} {status === 'COMING' ? 'Coming' : status === 'MAYBE' ? 'Maybe' : 'Not Coming'}
    </span>
  );
}

export default function DashboardRSVP() {
  const { id: invitationId } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [invitation, setInvitation] = useState<any>(null);
  const [stats, setStats] = useState<RSVPStats | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<RSVPStatus | 'ALL'>('ALL');
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');

  // Detail/delete modals
  const [selectedRsvp, setSelectedRsvp] = useState<RSVP | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RSVP | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Prasad planning
  const [buffer, setBuffer] = useState(10);

  const load = useCallback(async () => {
    if (!invitationId) return;
    setLoading(true);
    const [invResult, statsResult, rsvpResult] = await Promise.all([
      supabase.from('invitations').select('*').eq('id', invitationId).single(),
      getRSVPStats(invitationId),
      getRSVPsForInvitation(invitationId, filter, sort),
    ]);
    if (invResult.data) setInvitation(invResult.data);
    setStats(statsResult);
    setRsvps(rsvpResult);
    setLoading(false);
  }, [invitationId, filter, sort]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!invitationId) return;
    const channel = supabase
      .channel(`rsvps-${invitationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rsvps',
        filter: `invitation_id=eq.${invitationId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [invitationId, load]);

  const filtered = rsvps.filter(r => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return r.guest_name.toLowerCase().includes(s) || (r.message || '').toLowerCase().includes(s);
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteRSVP(deleteTarget.id);
    if (error) { showToast(error, 'error'); }
    else { showToast('RSVP deleted', 'success'); setDeleteTarget(null); load(); }
    setDeleting(false);
  }

  const confirmedPeople = stats?.confirmed_people || 0;
  const prasadCount = Math.ceil(confirmedPeople * (1 + buffer / 100));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <div className="text-4xl animate-float">🙏</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="gold-card p-6 w-full max-w-sm">
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-lg font-bold" style={{ color: '#3d1f00' }}>Delete RSVP?</h3>
                <p className="text-sm text-amber-700 mt-2">
                  Are you sure you want to delete <strong>{deleteTarget.guest_name}</strong>'s RSVP?
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                  className="flex-1 py-3 rounded-xl border font-medium text-sm hover:bg-gray-50"
                  style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: '#dc2626' }}>
                  {deleting ? '⌛...' : '🗑️ Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRsvp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedRsvp(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="gold-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold font-devanagari" style={{ color: '#3d1f00' }}>
                  {selectedRsvp.guest_name}
                </h3>
                <button onClick={() => setSelectedRsvp(null)} className="p-1"><X className="w-5 h-5 text-amber-400" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Status', value: <StatusPill status={selectedRsvp.status} /> },
                  { label: 'People', value: selectedRsvp.status === 'NOT_ATTENDING' ? '—' : String(selectedRsvp.attendee_count) },
                  selectedRsvp.message ? { label: 'Message', value: selectedRsvp.message } : null,
                  { label: 'Submitted', value: new Date(selectedRsvp.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                  { label: 'Last Updated', value: new Date(selectedRsvp.updated_at).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                ].filter(Boolean).map((r: any) => (
                  <div key={r.label} className="flex justify-between items-start gap-3 py-2 border-b last:border-0"
                    style={{ borderColor: 'rgba(212,160,23,0.15)' }}>
                    <span className="text-sm text-amber-600 flex-shrink-0">{r.label}</span>
                    <span className="text-sm font-semibold text-right" style={{ color: '#3d1f00' }}>
                      {typeof r.value === 'string' ? r.value : r.value}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setDeleteTarget(selectedRsvp); setSelectedRsvp(null); }}
                className="mt-4 w-full py-2 rounded-xl text-sm font-medium text-red-600 border hover:bg-red-50"
                style={{ borderColor: 'rgba(220,38,38,0.3)' }}>
                🗑️ Delete RSVP
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard/invitations" className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Invitations
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>
                🙏 RSVP Dashboard
              </h1>
              <p className="text-sm text-amber-700">{invitation?.host_name} — {invitation?.city}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/dashboard/invitations/${invitationId}/rsvp/settings`}
                className="px-3 py-2 rounded-xl text-xs font-medium border hover:bg-amber-50"
                style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                ⚙️ Settings
              </Link>
              <button onClick={load} className="px-3 py-2 rounded-xl text-xs font-medium border hover:bg-amber-50"
                style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total_count, icon: '📊', color: '#ff7300' },
              { label: '❤️ Coming', value: stats.coming_count, icon: '❤️', color: '#16a34a' },
              { label: '🤔 Maybe', value: stats.maybe_count, icon: '🤔', color: '#d97706' },
              { label: '😔 Not Coming', value: stats.not_count, icon: '😔', color: '#6b7280' },
              { label: 'Confirmed People', value: stats.confirmed_people, icon: '👥', color: '#7c3aed' },
              { label: 'Possible People', value: stats.possible_people, icon: '🤷', color: '#0891b2' },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="dashboard-stat-card">
                <p className="text-[10px] text-amber-600 mb-1">{card.label}</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filters + Search */}
        <div className="gold-card p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 flex-wrap">
              {(['ALL', 'COMING', 'MAYBE', 'NOT_ATTENDING'] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === s ? 'text-white' : 'bg-white border text-amber-700 hover:bg-amber-50'
                  }`}
                  style={filter === s ? {
                    background: s === 'COMING' ? '#16a34a' : s === 'MAYBE' ? '#d97706' : s === 'NOT_ATTENDING' ? '#6b7280' : 'linear-gradient(135deg,#ff9233,#ff7300)',
                  } : { borderColor: 'rgba(212,160,23,0.3)' }}>
                  {s === 'ALL' ? 'All' : s === 'COMING' ? '❤️ Coming' : s === 'MAYBE' ? '🤔 Maybe' : '😔 Not Coming'}
                </button>
              ))}
            </div>

            <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
              className="px-3 py-1.5 rounded-lg text-xs border bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="most_people">Most attendees</option>
              <option value="fewest_people">Fewest attendees</option>
            </select>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 flex-1 min-w-40 bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)' }}>
              <Search className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <input type="text" placeholder="Search guests..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none" style={{ color: '#3d1f00' }} />
            </div>

            <button onClick={() => exportRSVPCsv(rsvps, invitation?.host_name || 'rsvp')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border hover:bg-amber-50"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Guest List */}
        {filtered.length === 0 ? (
          <div className="gold-card p-12 text-center">
            <div className="text-4xl mb-3">🙏</div>
            <p className="text-amber-600 font-devanagari">
              {rsvps.length === 0 ? 'अजून कोणी RSVP केलेले नाही' : 'No results found'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="gold-card overflow-hidden hidden md:block mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold text-amber-600"
                    style={{ borderColor: 'rgba(212,160,23,0.2)', background: 'rgba(255,115,0,0.03)' }}>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">People</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-amber-50 transition-colors cursor-pointer"
                      style={{ borderColor: 'rgba(212,160,23,0.12)' }}
                      onClick={() => setSelectedRsvp(r)}>
                      <td className="px-4 py-3 font-semibold font-devanagari" style={{ color: '#3d1f00' }}>
                        {r.guest_name}
                      </td>
                      <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                      <td className="px-4 py-3 font-bold tabular-nums" style={{ color: '#ff7300' }}>
                        {r.status === 'NOT_ATTENDING' ? '—' : r.attendee_count}
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-600 max-w-[200px] truncate">
                        {r.message || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-500 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3 mb-6">
              {filtered.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="gold-card p-4 cursor-pointer" onClick={() => setSelectedRsvp(r)}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>{r.guest_name}</p>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-amber-600">
                    {r.status !== 'NOT_ATTENDING' && (
                      <span>👥 {r.attendee_count} people</span>
                    )}
                    <span>{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  {r.message && (
                    <p className="text-xs text-amber-500 mt-1 truncate">💬 {r.message}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="text-xs text-amber-500 text-right mb-6">
          Showing {filtered.length} of {rsvps.length} responses
        </div>

        {/* Prasad Planning */}
        {stats && stats.confirmed_people > 0 && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="gold-card p-6 mb-6">
            <h2 className="font-bold mb-4 font-devanagari" style={{ color: '#3d1f00' }}>🍛 Prasad Planning</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-amber-600 mb-0.5">Confirmed attendees</p>
                <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{stats.confirmed_people}</p>
              </div>
              <div>
                <p className="text-xs text-amber-600 mb-0.5">Extra buffer</p>
                <div className="flex items-center gap-2">
                  <input type="number" value={buffer} onChange={e => setBuffer(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-16 px-2 py-1 rounded-lg border text-sm text-center"
                    style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }} />
                  <span className="text-sm text-amber-600">%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-amber-600 mb-0.5">Recommended preparation</p>
                <p className="text-2xl font-bold" style={{ color: '#ff7300' }}>{prasadCount} people</p>
              </div>
            </div>
            <p className="text-xs text-amber-500">⚠️ This is an estimate based on confirmed RSVPs.</p>
          </motion.div>
        )}

        {/* Recent activity */}
        {rsvps.length > 0 && (
          <div className="gold-card p-6">
            <h2 className="font-bold mb-4 font-devanagari" style={{ color: '#3d1f00' }}>📋 Recent Activity</h2>
            <div className="space-y-2">
              {rsvps.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b last:border-0"
                  style={{ borderColor: 'rgba(212,160,23,0.1)' }}>
                  <span className="text-lg">{STATUS_LABELS[r.status].icon}</span>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: '#3d1f00' }}>
                      <strong className="font-devanagari">{r.guest_name}</strong>
                      {r.status === 'COMING' ? ` confirmed — ${r.attendee_count} people` :
                       r.status === 'MAYBE' ? ' selected Maybe' : ' cannot attend'}
                    </p>
                  </div>
                  <span className="text-xs text-amber-400">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
