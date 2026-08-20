import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function toggleAdmin(id: string, current: boolean) {
    await supabase.from('users').update({ is_admin: !current }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: !current } : u));
    showToast(`Admin status updated.`, 'success');
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    await supabase.from('users').delete().eq('id', id);
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('User deleted.', 'info');
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d1f00' }}>👥 Users</h1>
          <p className="text-sm text-amber-700">{users.length} registered users</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-amber-600">⌛ Loading...</div>
        ) : (
          <div className="gold-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: 'rgba(255,243,224,0.5)', borderColor: 'rgba(212,160,23,0.2)' }}>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Name</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Email</th>
                    <th className="text-center px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Admin</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: '#3d1f00' }}>Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-amber-50 transition-colors" style={{ borderColor: 'rgba(212,160,23,0.1)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-sm font-bold text-saffron-600">
                            {(u.name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: '#3d1f00' }}>{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-amber-700">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleAdmin(u.id, u.is_admin)}
                          className={`w-10 h-5 rounded-full transition-all relative ${u.is_admin ? 'bg-saffron-500' : 'bg-gray-200'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${u.is_admin ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-amber-500">
                        {new Date(u.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteUser(u.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-12 text-amber-500">No users yet.</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
