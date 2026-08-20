import { useState } from 'react';
import type { BuilderState } from '../../types';
import { PREDEFINED_MESSAGES } from '../../data/templates';

interface Props { state: BuilderState; update: (p: Partial<BuilderState>) => void; }

const MESSAGE_CATEGORIES = [
  { key: 'traditional', label: 'पारंपरिक', icon: '🙏' },
  { key: 'emotional', label: 'भावपूर्ण', icon: '❤️' },
  { key: 'short', label: 'छोटा', icon: '✨' },
  { key: 'family', label: 'कौटुंबिक', icon: '👨‍👩‍👧‍👦' },
  { key: 'friends', label: 'मित्र', icon: '👥' },
  { key: 'neighbors', label: 'शेजारी', icon: '🏘️' },
  { key: 'formal', label: 'औपचारिक', icon: '📜' },
] as const;

export default function Step4Message({ state, update }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function selectMessage(key: string) {
    const msg = PREDEFINED_MESSAGES[key as keyof typeof PREDEFINED_MESSAGES];
    if (msg) {
      update({ message: msg });
      setActiveCategory(key);
    }
  }

  return (
    <div className="gold-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
          💬 Step 4 — आमंत्रण संदेश
        </h2>
        <p className="text-sm text-amber-700">Choose a ready-made message or write your own</p>
      </div>

      {/* Category buttons */}
      <div className="mb-5">
        <p className="text-sm font-semibold mb-3 font-devanagari" style={{ color: '#3d1f00' }}>
          तयार संदेश निवडा:
        </p>
        <div className="flex flex-wrap gap-2">
          {MESSAGE_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => selectMessage(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                activeCategory === cat.key
                  ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                  : 'border-amber-200 text-amber-700 hover:border-amber-300 bg-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="font-devanagari">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message editor */}
      <div>
        <label className="block text-sm font-semibold mb-2 font-devanagari" style={{ color: '#3d1f00' }}>
          आमंत्रण संदेश <span className="text-red-500">*</span>
        </label>
        <textarea
          value={state.message}
          onChange={e => { update({ message: e.target.value }); setActiveCategory(null); }}
          rows={12}
          placeholder="तुमचा आमंत्रण संदेश इथे लिहा..."
          className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors focus:border-saffron-400 bg-white font-devanagari leading-relaxed"
          style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00', resize: 'vertical' }}
        />
        <p className="text-xs text-amber-500 mt-2">
          {state.message.length} characters • Tip: Use [Guest Name] to personalize further
        </p>
      </div>

      {/* Preview */}
      {state.message && (
        <div className="mt-5 p-5 rounded-xl border-l-4 font-devanagari text-sm leading-relaxed whitespace-pre-wrap"
          style={{ background: 'rgba(255,243,224,0.8)', borderColor: '#ff7300', color: '#3d1f00' }}>
          {state.message}
        </div>
      )}
    </div>
  );
}
