import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function DashboardAnalytics() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [rsvpData, setRsvpData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (!loading && !user) navigate('/'); }, [user, loading]);
  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const { data: invs } = await supabase.from('invitations').select('id, host_name, slug, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10);
    if (!invs?.length) { setIsLoading(false); return; }

    const invIds = invs.map(i => i.id);
    const [viewRes, shareRes, flowerRes, diyaRes, rsvpRes] = await Promise.all([
      supabase.from('invitation_views').select('invitation_id').in('invitation_id', invIds),
      supabase.from('invitation_shares').select('invitation_id').in('invitation_id', invIds),
      supabase.from('flower_offerings').select('invitation_id').in('invitation_id', invIds),
      supabase.from('diya_offerings').select('invitation_id').in('invitation_id', invIds),
      supabase.from('rsvps').select('invitation_id, status, attendee_count').in('invitation_id', invIds),
    ]);

    const countBy = (arr: any[], key: string) => {
      const map: Record<string, number> = {};
      (arr || []).forEach(r => { map[r[key]] = (map[r[key]] || 0) + 1; });
      return map;
    };

    const viewMap = countBy(viewRes.data || [], 'invitation_id');
    const shareMap = countBy(shareRes.data || [], 'invitation_id');
    const flowerMap = countBy(flowerRes.data || [], 'invitation_id');
    const diyaMap = countBy(diyaRes.data || [], 'invitation_id');

    const rows = invs.map(inv => ({
      name: inv.host_name.slice(0, 12),
      views: viewMap[inv.id] || 0,
      shares: shareMap[inv.id] || 0,
      flowers: flowerMap[inv.id] || 0,
      diyas: diyaMap[inv.id] || 0,
    }));
    setAnalytics(rows);

    // RSVP pie
    const yesCount = (rsvpRes.data || []).filter((r: any) => r.status === 'COMING').length;
    const maybeCount = (rsvpRes.data || []).filter((r: any) => r.status === 'MAYBE').length;
    const noCount = (rsvpRes.data || []).filter((r: any) => r.status === 'NOT_ATTENDING').length;
    setRsvpData([
      { name: 'नक्की येणार', value: yesCount, color: '#27ae60' },
      { name: 'प्रयत्न करतोय', value: maybeCount, color: '#f39c12' },
      { name: 'येणार नाही', value: noCount, color: '#e74c3c' },
    ]);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>📊 Analytics</h1>
          <p className="text-sm text-amber-700">Invitation performance overview</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-amber-600 font-devanagari">⌛ लोड होत आहे...</div>
        ) : (
          <div className="space-y-6">
            {/* Views & Shares chart */}
            <div className="gold-card p-6">
              <h2 className="font-bold mb-4" style={{ color: '#3d1f00' }}>👁️ Views & Shares per Invitation</h2>
              {analytics.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7a4c2a' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#7a4c2a' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,160,23,0.3)', fontSize: '12px' }} />
                    <Bar dataKey="views" name="Views" fill="#ff7300" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="shares" name="Shares" fill="#d4a017" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-amber-500 text-sm text-center py-8">अजून data नाही.</p>}
            </div>

            {/* Offerings chart */}
            <div className="gold-card p-6">
              <h2 className="font-bold mb-4" style={{ color: '#3d1f00' }}>🌸 Offerings per Invitation</h2>
              {analytics.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7a4c2a' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#7a4c2a' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,160,23,0.3)', fontSize: '12px' }} />
                    <Bar dataKey="flowers" name="Flowers 🌸" fill="#e91e63" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="diyas" name="Diyas 🪔" fill="#ff9800" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-amber-500 text-sm text-center py-8">अजून data नाही.</p>}
            </div>

            {/* RSVP pie */}
            <div className="gold-card p-6">
              <h2 className="font-bold mb-4" style={{ color: '#3d1f00' }}>🙏 RSVP Summary</h2>
              {rsvpData.some(r => r.value > 0) ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={rsvpData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {rsvpData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {rsvpData.map(r => (
                      <div key={r.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                        <span className="font-devanagari" style={{ color: '#3d1f00' }}>{r.name}</span>
                        <span className="font-bold" style={{ color: r.color }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-amber-500 text-sm text-center py-8">अजून RSVP नाही.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
