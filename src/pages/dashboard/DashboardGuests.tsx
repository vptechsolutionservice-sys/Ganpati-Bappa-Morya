import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface GuestRow {
  id: string;
  name: string;
  slug: string;
  invitation_id: string;
  invitation_host: string;
  rsvp?: { status: string; attendee_count: number };
  viewed: boolean;
}

const RSVP_LABELS: Record<string, { label: string; color: string }> = {
  COMING: { label: 'नक्की येणार', color: '#27ae60' },
  MAYBE: { label: 'कदाचित येऊ', color: '#f39c12' },
  NOT_ATTENDING: { label: 'येणार नाही', color: '#e74c3c' },
};

export default function DashboardGuests() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [filtered, setFiltered] = useState<GuestRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (!loading && !user) navigate('/'); }, [user, loading]);
  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => {
    setFiltered(guests.filter(g => g.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, guests]);

  async function load() {
    const { data: invs } = await supabase.from('invitations').select('id, host_name').eq('user_id', user!.id);
    if (!invs?.length) { setIsLoading(false); return; }

    const invIds = invs.map(i => i.id);
    const [guestRes, rsvpRes, viewRes] = await Promise.all([
      supabase.from('guests').select('*').in('invitation_id', invIds).order('created_at', { ascending: false }),
      supabase.from('rsvps').select('*').in('invitation_id', invIds),
      supabase.from('invitation_views').select('guest_id').in('invitation_id', invIds).not('guest_id', 'is', null),
    ]);

    const rsvpMap = Object.fromEntries((rsvpRes.data || []).map((r: any) => [r.guest_token, r]));
    const viewedSet = new Set((viewRes.data || []).map((v: any) => v.guest_id));
    const invMap = Object.fromEntries(invs.map(i => [i.id, i.host_name]));

    const rows: GuestRow[] = (guestRes.data || []).map(g => ({
      ...g,
      invitation_host: invMap[g.invitation_id] || '',
      rsvp: rsvpMap[g.id],
      viewed: viewedSet.has(g.id),
    }));

    setGuests(rows);
    setFiltered(rows);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>👥 Guest Management</h1>
          <p className="text-sm text-amber-700">Track all your guests and their responses</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Guest चे नाव शोधा..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 text-sm outline-none bg-white"
            style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }} />
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-amber-600 font-devanagari">⌛ लोड होत आहे...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👥</div>
            <p className="font-devanagari text-amber-700">अजून कोणतेही guests नाहीत.</p>
          </div>
        ) : (
          <div className="gold-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(212,160,23,0.2)', background: 'rgba(255,243,224,0.5)' }}>
                    <th className="text-left px-4 py-3 font-semibold font-devanagari" style={{ color: '#3d1f00' }}>Guest</th>
                    <th className="text-left px-4 py-3 font-semibold font-devanagari" style={{ color: '#3d1f00' }}>Invitation</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>RSVP</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>जण</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => (
                    <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b hover:bg-amber-50 transition-colors" style={{ borderColor: 'rgba(212,160,23,0.1)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-saffron-100 flex items-center justify-center text-xs font-bold text-saffron-600">
                            {g.name[0]}
                          </div>
                          <span className="font-medium font-devanagari" style={{ color: '#3d1f00' }}>{g.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-amber-600 text-xs">{g.invitation_host}</td>
                      <td className="px-4 py-3">
                        {g.rsvp ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ background: RSVP_LABELS[g.rsvp.status]?.color || '#95a5a6' }}>
                            {RSVP_LABELS[g.rsvp.status]?.label || g.rsvp.status}
                          </span>
                        ) : <span className="text-xs text-amber-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-medium" style={{ color: '#3d1f00' }}>
                        {g.rsvp?.attendee_count || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {g.viewed ? <span className="text-green-500 text-xs">✓ Yes</span> : <span className="text-amber-400 text-xs">—</span>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
