import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';
import { compressImage } from '../../lib/utils';

const CATEGORIES = ['traditional', 'royal', 'eco', 'bal_ganesh', 'minimal', 'decorative', 'maharashtrian', 'artistic', 'modern'];

export default function AdminImages() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'traditional' });
  const fileRef = useRef<HTMLInputElement>(null);
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('ganpati_images').select('*').order('created_at', { ascending: false });
    setImages(data || []);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.title.trim()) { showToast('Please enter a title.', 'error'); return; }

    setUploading(true);
    try {
      const compressed = await compressImage(file, 1200, 0.85);
      const path = `ganpati/${Date.now()}.webp`;
      await supabase.storage.from('ganpati-images').upload(path, compressed, { contentType: 'image/webp' });
      const { data: { publicUrl } } = supabase.storage.from('ganpati-images').getPublicUrl(path);
      await supabase.from('ganpati_images').insert({ title: form.title, category: form.category, image_url: publicUrl, status: 'active' });
      showToast('Image uploaded! ✓', 'success');
      setForm({ title: '', category: 'traditional' });
      await load();
    } catch { showToast('Upload failed.', 'error'); }
    finally { setUploading(false); }
  }

  async function deleteImage(id: string) {
    if (!confirm('Delete this image?')) return;
    await supabase.from('ganpati_images').delete().eq('id', id);
    setImages(prev => prev.filter(i => i.id !== id));
  }

  async function toggleStatus(id: string, current: string) {
    const newS = current === 'active' ? 'inactive' : 'active';
    await supabase.from('ganpati_images').update({ status: newS }).eq('id', id);
    setImages(prev => prev.map(i => i.id === id ? { ...i, status: newS } : i));
  }

  const filtered = filterCat === 'all' ? images : images.filter(i => i.category === filterCat);

  return (
    <AdminLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#3d1f00' }}>🖼️ Ganpati Images</h1>
          <p className="text-sm text-amber-700">Manage the Ganpati image gallery</p>
        </div>

        {/* Upload form */}
        <div className="gold-card p-6 mb-6">
          <h2 className="font-bold mb-4" style={{ color: '#3d1f00' }}>Upload New Image</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Image title"
              className="px-4 py-2.5 rounded-xl border-2 text-sm outline-none bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }} />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border-2 text-sm outline-none bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="btn-saffron text-sm py-2.5">
              <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Choose & Upload'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                filterCat === c ? 'border-saffron-500 bg-saffron-50 text-saffron-700' : 'border-amber-200 text-amber-700'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-amber-600">⌛ Loading...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((img, i) => (
              <motion.div key={img.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl overflow-hidden border relative group"
                style={{ borderColor: 'rgba(212,160,23,0.2)', background: '#fffdf5' }}>
                <img src={img.image_url} alt={img.title} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <p className="text-xs font-semibold truncate" style={{ color: '#3d1f00' }}>{img.title}</p>
                  <p className="text-[10px] text-amber-500">{img.category}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleStatus(img.id, img.status)}
                    className="p-1 rounded-full bg-white/90 text-xs"
                    title={img.status === 'active' ? 'Disable' : 'Enable'}>
                    {img.status === 'active' ? '✓' : '✗'}
                  </button>
                  <button onClick={() => deleteImage(img.id)}
                    className="p-1 rounded-full bg-red-500 text-white">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-amber-500">No images yet. Upload some!</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
