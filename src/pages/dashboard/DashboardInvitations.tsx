import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Share2, Edit, Trash2, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';
import type { Invitation } from '../../types';

export default function DashboardInvitations() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) navigate('/'); }, [user, loading]);
  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const { data } = await supabase.from('invitations').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    setInvitations(data || []);
    setIsLoading(false);
  }

  async function deleteInv(id: string) {
    if (!confirm('हे आमंत्रण delete करायचे आहे का?')) return;
    await supabase.from('invitations').delete().eq('id', id);
    setInvitations(prev => prev.filter(i => i.id !== id));
    showToast('आमंत्रण delete झाले.', 'info');
  }

  async function copyLink(slug: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`);
    setCopiedSlug(slug);
    showToast('Link copied!', 'success');
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  const STATUS_COLORS: Record<string, string> = {
    active: '#27ae60', draft: '#f39c12', visarjan: '#9b59b6', archived: '#95a5a6',
  };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>📜 माझी आमंत्रणे</h1>
            <p className="text-sm text-amber-700">Manage your Ganpati invitations</p>
          </div>
          <Link to="/create" className="btn-saffron text-sm px-5 py-2.5">+ नवीन</Link>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-amber-600 font-devanagari">⌛ लोड होत आहे...</div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🙏</div>
            <p className="font-devanagari text-xl mb-2" style={{ color: '#3d1f00' }}>अजून कोणतेही आमंत्रण नाही</p>
            <p className="text-amber-600 text-sm mb-6">Create your first Ganpati invitation!</p>
            <Link to="/create" className="btn-saffron px-8 py-3">🙏 पहिले आमंत्रण तयार करा</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="gold-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-saffron-100 flex items-center justify-center text-2xl flex-shrink-0">🪔</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>{inv.host_name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: STATUS_COLORS[inv.status] || '#95a5a6' }}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-sm text-amber-700">{inv.city} • {inv.arrival_date}</p>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">/invite/{inv.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/invite/${inv.slug}`} target="_blank"
                    className="p-2 rounded-lg hover:bg-amber-100 transition-colors" title="Preview">
                    <Eye className="w-4 h-4 text-amber-600" />
                  </Link>
                  <Link to={`/dashboard/invitations/${inv.id}/rsvp`}
                    className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="RSVP Dashboard">
                    <span className="text-sm">🙏</span>
                  </Link>
                  <button onClick={() => copyLink(inv.slug)} className="p-2 rounded-lg hover:bg-amber-100" title="Copy link">
                    {copiedSlug === inv.slug ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-amber-600" />}
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`🙏 ${window.location.origin}/invite/${inv.slug}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-green-50" title="WhatsApp">
                    <Share2 className="w-4 h-4 text-green-600" />
                  </a>
                  <button onClick={() => deleteInv(inv.id)} className="p-2 rounded-lg hover:bg-red-50" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
