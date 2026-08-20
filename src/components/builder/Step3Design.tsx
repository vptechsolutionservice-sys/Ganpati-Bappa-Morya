import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check } from 'lucide-react';
import type { BuilderState } from '../../types';
import { TEMPLATES, TEMPLATE_EMOJIS } from '../../data/templates';
import { supabase } from '../../lib/supabase';
import { showToast } from '../ui/Toaster';
import { compressImage } from '../../lib/utils';

interface Props { state: BuilderState; update: (p: Partial<BuilderState>) => void; }

const COLORS = [
  { name: 'Saffron', value: 'saffron', color: '#ff7300' },
  { name: 'Maroon', value: 'maroon', color: '#c0392b' },
  { name: 'Red', value: 'red', color: '#e53e3e' },
  { name: 'Gold', value: 'gold', color: '#d4a017' },
  { name: 'Cream', value: 'cream', color: '#fdf6e3' },
  { name: 'Green', value: 'green', color: '#2e7d32' },
];

const DECORATIONS: { key: keyof BuilderState; label: string; icon: string }[] = [
  { key: 'show_flowers', label: 'Flowers', icon: '🌸' },
  { key: 'show_toran', label: 'Toran', icon: '🌺' },
  { key: 'show_diyas', label: 'Diyas', icon: '🪔' },
  { key: 'show_rangoli', label: 'Rangoli', icon: '🎨' },
  { key: 'show_bells', label: 'Bells', icon: '🔔' },
  { key: 'show_particles', label: 'Particles', icon: '✨' },
  { key: 'show_mandala', label: 'Mandala', icon: '🌀' },
];

export default function Step3Design({ state, update }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('फोटो 10MB पेक्षा लहान असावा.', 'error');
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file, 1200, 0.85);
      const ext = 'webp';
      const path = `ganpati-images/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('invitation-assets')
        .upload(path, compressed, { contentType: 'image/webp', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('invitation-assets')
        .getPublicUrl(path);

      update({ ganpati_image_url: publicUrl });
      showToast('फोटो यशस्वीरीत्या अपलोड झाला! ✓', 'success');
    } catch {
      showToast('फोटो अपलोड करता आला नाही. कृपया पुन्हा प्रयत्न करा.', 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Gallery */}
      <div className="gold-card p-6 sm:p-8">
        <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
          🎨 Step 3 — Template निवडा
        </h2>
        <p className="text-sm text-amber-700 mb-6">Choose a beautiful design for your invitation</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TEMPLATES.map(template => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => update({ template_id: template.id, theme: template.configuration.primaryColor })}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                state.template_id === template.id
                  ? 'border-saffron-500 bg-saffron-50'
                  : 'border-amber-200 hover:border-amber-300 bg-white'
              }`}
            >
              {state.template_id === template.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-saffron-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-3xl">{TEMPLATE_EMOJIS[template.id]}</span>
              <span className="text-xs font-semibold text-center font-devanagari" style={{ color: '#3d1f00' }}>
                {template.name_marathi}
              </span>
              <span className="text-[10px] text-amber-500">{template.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Ganpati Image Upload */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
          📸 बाप्पांचा फोटो
        </h3>

        {state.ganpati_image_url ? (
          <div className="flex items-start gap-4">
            <img
              src={state.ganpati_image_url}
              alt="Ganpati"
              className="w-24 h-24 object-cover rounded-xl border-2"
              style={{ borderColor: 'rgba(212,160,23,0.4)' }}
            />
            <div>
              <p className="text-sm text-green-600 font-medium mb-2">✓ फोटो अपलोड झाला!</p>
              <button
                onClick={() => { update({ ganpati_image_url: '' }); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed transition-all hover:bg-amber-50"
            style={{ borderColor: 'rgba(212,160,23,0.4)' }}
          >
            <Upload className="w-8 h-8 text-amber-400" />
            <p className="text-sm font-medium text-amber-700">
              {uploading ? '⌛ अपलोड होत आहे...' : 'बाप्पांचा फोटो अपलोड करा'}
            </p>
            <p className="text-xs text-amber-500">PNG, JPG, WEBP — Max 10MB</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Colors */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
          🎨 Theme Color
        </h3>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => update({ theme: c.value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                state.theme === c.value ? 'border-gray-800 shadow-md' : 'border-transparent hover:border-gray-300'
              }`}
              style={{ background: c.color + '20' }}
            >
              <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ background: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Decorations */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
          ✨ सजावट (Decorations)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DECORATIONS.map(d => (
            <button
              key={d.key}
              onClick={() => update({ [d.key]: !state[d.key] } as Partial<BuilderState>)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                state[d.key]
                  ? 'border-saffron-400 bg-saffron-50 text-saffron-700'
                  : 'border-amber-200 text-amber-600 bg-white hover:border-amber-300'
              }`}
            >
              <span>{d.icon}</span>
              <span>{d.label}</span>
              {state[d.key] && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Music */}
      <div className="gold-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>🎵 Background Music</h3>
            <p className="text-xs text-amber-600 mt-0.5">Soft Ganpati instrumental (user-controlled)</p>
          </div>
          <button
            onClick={() => update({ music_enabled: !state.music_enabled })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              state.music_enabled ? 'bg-saffron-500' : 'bg-gray-200'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
              state.music_enabled ? 'right-1' : 'left-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
