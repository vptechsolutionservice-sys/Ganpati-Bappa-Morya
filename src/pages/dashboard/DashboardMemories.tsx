import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Trash2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';
import { compressImage } from '../../lib/utils';

interface Memory { id: string; image_url: string; caption?: string; invitation_id: string; created_at: string; }

export default function DashboardMemories() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [invitations, setInvitations] = useState<{ id: string; host_name: string }[]>([]);
  const [selectedInv, setSelectedInv] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!loading && !user) navigate('/'); }, [user, loading]);
  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const { data: invs } = await supabase.from('invitations').select('id, host_name').eq('user_id', user!.id);
    setInvitations(invs || []);
    if (invs?.length) {
      setSelectedInv(invs[0].id);
      loadMemories(invs[0].id);
    }
  }

  async function loadMemories(invId: string) {
    const { data } = await supabase.from('memories').select('*').eq('invitation_id', invId).order('created_at', { ascending: false });
    setMemories(data || []);
  }

  async function uploadMemory(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedInv) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 1600, 0.85);
      const path = `memories/${selectedInv}/${Date.now()}.webp`;
      await supabase.storage.from('memories').upload(path, compressed, { contentType: 'image/webp' });
      const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(path);
      await supabase.from('memories').insert({ invitation_id: selectedInv, image_url: publicUrl, caption: caption.trim() || null });
      showToast('आठवण जोडली! ✓', 'success');
      setCaption('');
      await loadMemories(selectedInv);
    } catch { showToast('अपलोड अयशस्वी. पुन्हा प्रयत्न करा.', 'error'); }
    finally { setUploading(false); }
  }

  async function deleteMemory(id: string, imageUrl: string) {
    if (!confirm('हा फोटो delete करायचा आहे का?')) return;
    await supabase.from('memories').delete().eq('id', id);
    setMemories(prev => prev.filter(m => m.id !== id));
    showToast('फोटो delete झाला.', 'info');
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>📷 बाप्पांच्या आठवणी</h1>
          <p className="text-sm text-amber-700">Upload and manage your Ganpati memories</p>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-devanagari text-amber-700">आधी एक invitation तयार करा.</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="gold-card p-6 mb-6 space-y-4">
              {invitations.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold mb-2 font-devanagari" style={{ color: '#3d1f00' }}>Invitation निवडा</label>
                  <select value={selectedInv} onChange={e => { setSelectedInv(e.target.value); loadMemories(e.target.value); }}
                    className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none bg-white"
                    style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}>
                    {invitations.map(inv => <option key={inv.id} value={inv.id}>{inv.host_name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 font-devanagari" style={{ color: '#3d1f00' }}>Caption (ऐच्छिक)</label>
                <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
                  placeholder="फोटोची माहिती लिहा..."
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none bg-white"
                  style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }} />
              </div>

              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="btn-saffron w-full py-4 text-sm">
                <Upload className="w-4 h-4" />
                {uploading ? '⌛ अपलोड होत आहे...' : '📷 फोटो अपलोड करा'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={uploadMemory} />
            </div>

            {/* Masonry gallery */}
            {memories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📷</div>
                <p className="font-devanagari text-amber-700">अजून कोणतेही फोटो नाहीत.</p>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {memories.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="break-inside-avoid rounded-2xl overflow-hidden border relative group"
                    style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
                    <img src={m.image_url} alt={m.caption || 'Memory'} className="w-full object-cover" />
                    {m.caption && <p className="px-3 py-2 text-xs text-amber-700 font-devanagari" style={{ background: '#fffdf5' }}>{m.caption}</p>}
                    <button onClick={() => deleteMemory(m.id, m.image_url)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
