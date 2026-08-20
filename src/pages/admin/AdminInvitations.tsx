import { useEffect, useState } from 'react';
import { Eye, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';

const STATUS_COLORS: Record<string, string> = {
  active: '#27ae60', draft: '#f39c12', visarjan: '#9b59b6', archived: '#95a5a6',
};

export default function AdminInvitations() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
    setInvitations(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('invitations').update({ status }).eq('id', id);
    setInvitations(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    showToast('Status updated.', 'success');
  }

  async function deleteInvitation(id: string) {
    if (!confirm('Delete this invitation?')) return;
    await supabase.from('invitations').delete().eq('id', id);
    setInvitations(prev => prev.filter(i => i.id !== id));
    showToast('Invitation deleted.', 'info');
  }

  const filtered = invitations.filter(i =>
    i.host_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.city?.toLowerCase().includes(search.toLowerCase()) ||
    i.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d1f00' }}>📜 Invitations</h1>
            <p className="text-sm text-amber-700">{invitations.length} total invitations</p>
          </div>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-4 py-2 rounded-xl border-2 text-sm outline-none bg-white"
            style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-amber-600">⌛ Loading...</div>
        ) : (
          <div className="gold-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: 'rgba(255,243,224,0.5)', borderColor: 'rgba(212,160,23,0.2)' }}>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Host</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>City</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Arrival</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Status</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Created</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-amber-50 transition-colors" style={{ borderColor: 'rgba(212,160,23,0.1)' }}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium font-devanagari" style={{ color: '#3d1f00' }}>{inv.host_name}</p>
                          <p className="text-xs text-amber-400 font-mono">{inv.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-amber-700">{inv.city}</td>
                      <td className="px-4 py-3 text-xs text-amber-600">{inv.arrival_date}</td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={inv.status}
                          onChange={e => updateStatus(inv.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ background: STATUS_COLORS[inv.status] || '#95a5a6' }}
                        >
                          {['draft', 'active', 'visarjan', 'archived'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-500">
                        {new Date(inv.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/invite/${inv.slug}`} target="_blank" className="p-1 hover:text-saffron-600 text-amber-500">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteInvitation(inv.id)} className="p-1 hover:text-red-600 text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-amber-500">No invitations found.</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
