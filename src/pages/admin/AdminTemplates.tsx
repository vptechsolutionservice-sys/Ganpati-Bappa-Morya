import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';
import { TEMPLATES, TEMPLATE_EMOJIS } from '../../data/templates';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
    // Merge DB templates with local ones if DB empty
    if (data && data.length > 0) {
      setTemplates(data);
    } else {
      setTemplates(TEMPLATES.map(t => ({ ...t, id: t.id })));
    }
    setLoading(false);
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    await supabase.from('templates').update({ status: newStatus }).eq('id', id);
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    await supabase.from('templates').delete().eq('id', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast('Template deleted.', 'info');
  }

  async function seedTemplates() {
    for (const t of TEMPLATES) {
      await supabase.from('templates').upsert({
        id: t.id,
        name: t.name,
        name_marathi: t.name_marathi,
        category: t.category,
        configuration: t.configuration,
        status: 'active',
      }, { onConflict: 'id' });
    }
    showToast('Templates seeded! ✓', 'success');
    load();
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d1f00' }}>🎨 Templates</h1>
            <p className="text-sm text-amber-700">Manage invitation templates</p>
          </div>
          <button onClick={seedTemplates} className="btn-saffron text-sm px-4 py-2">
            <Upload className="w-4 h-4" /> Seed All Templates
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-amber-600">⌛ Loading...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="gold-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{TEMPLATE_EMOJIS[t.id] || '🎨'}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#3d1f00' }}>{t.name}</p>
                      {t.name_marathi && <p className="text-xs text-amber-600 font-devanagari">{t.name_marathi}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-amber-500 mb-4">Category: {t.category}</p>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(t.id, t.status)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium border-2 hover:bg-amber-50 transition-colors"
                    style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                    {t.status === 'active' ? '⏸ Disable' : '▶ Enable'}
                  </button>
                  <button onClick={() => deleteTemplate(t.id)}
                    className="py-2 px-3 rounded-xl text-xs font-medium hover:bg-red-50 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
